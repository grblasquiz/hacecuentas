/**
 * Genera INFOGRAFÍAS DE DATOS en formato retrato (1080×1350) para Bing Image
 * Search / Pinterest, a partir de la data estructurada que ya vive en el repo.
 *
 * Reusa el MISMO pipeline que scripts/generate-og-images.ts:
 *   satori (objeto JSX → SVG) → @resvg/resvg-js (SVG → PNG) → public/img/*.png
 *   + carga de fuentes Inter (400/700/800) cacheadas en scripts/.fonts, con
 *   fallback a descarga desde Google Fonts CDN (idéntico a ensureFont del OG).
 *
 * Por qué satori y no IA: los modelos de imagen INVENTAN los números. Una
 * infografía fiscal/calendario exige montos y fechas exactos → render desde la
 * fuente única de verdad (src/lib/data/*.ts) para que no se desincronice nunca.
 *
 * Datasets:
 *   1. Monotributo 2026 → public/img/infografia-monotributo-2026.png
 *      (importa CATEGORIAS, TOPES, CUOTA_SERVICIOS, CUOTA_BIENES, META)
 *   2. Feriados Argentina 2026 → public/img/infografia-feriados-argentina-2026.png
 *      (importa FERIADOS_AR_2026, META, formatFecha, tipoLabel)
 *
 * Idempotente: regenera siempre (2 imágenes, render ≈ instantáneo) y el output
 * es determinista, así que volver a correrlo no cambia nada salvo que cambie la
 * data fuente. El sitemap NO se mueve por re-correr esto (no toca JSONs salvo el
 * wireo manual, que es one-shot).
 *
 * Uso: node scripts/generate-data-infographics.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'img');
const FONTS_DIR = join(__dirname, '.fonts'); // mismo cache que el OG generator
mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Carga de fuentes — copiada de scripts/generate-og-images.ts (mismo cache,
// mismas URLs, mismo fallback a CDN). Inter 400 / 700 / 800.
// ---------------------------------------------------------------------------
const FONT_URLS = {
  'Inter-Regular.ttf':
    'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf',
  'Inter-Bold.ttf':
    'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf',
  'Inter-ExtraBold.ttf':
    'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZg.ttf',
};

async function ensureFont(name, url) {
  const dest = join(FONTS_DIR, name);
  if (existsSync(dest)) return readFileSync(dest);
  mkdirSync(FONTS_DIR, { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${name}: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  return buf;
}

async function loadFonts() {
  const entries = Object.entries(FONT_URLS);
  const loaded = await Promise.all(entries.map(([n, u]) => ensureFont(n, u)));
  // satori mapea weight 600 → la fuente más cercana; registramos 400/700/800.
  return [
    { name: 'Inter', data: loaded[0], weight: 400, style: 'normal' },
    { name: 'Inter', data: loaded[1], weight: 600, style: 'normal' },
    { name: 'Inter', data: loaded[1], weight: 700, style: 'normal' },
    { name: 'Inter', data: loaded[2], weight: 800, style: 'normal' },
  ];
}

// ---------------------------------------------------------------------------
// Importar la data fuente real (TS) desde este .mjs.
// El repo corre los scripts .ts con `node --experimental-strip-types`, así que
// un import dinámico de un .ts funciona bajo ese mismo runtime. Lo invocamos
// con ese flag más abajo (ver package.json: "og": node --experimental-strip-types).
// ---------------------------------------------------------------------------
const monoUrl = pathToFileURL(join(ROOT, 'src', 'lib', 'data', 'monotributo-2026.ts')).href;
const feriUrl = pathToFileURL(join(ROOT, 'src', 'lib', 'data', 'feriados-ar-2026.ts')).href;
const mono = await import(monoUrl);
const feri = await import(feriUrl);

// ---------------------------------------------------------------------------
// Paleta + dimensiones compartidas (formato retrato amigable Bing/Pinterest)
// ---------------------------------------------------------------------------
const W = 1080, H = 1350;
const ACCENT = '#2563eb';
const INK = '#0f172a';
const MUTED = '#475569';

const fmtMillon = (n) => Math.round(n).toLocaleString('es-AR');

function txt(text, { size = 26, weight = 400, color = INK, align = 'left', width, grow } = {}) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex', fontSize: `${size}px`, fontWeight: weight, color,
        justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        alignItems: 'center',
        ...(width ? { width: `${width}px` } : {}), ...(grow ? { flexGrow: 1 } : {}),
        whiteSpace: 'nowrap',
      },
      children: text,
    },
  };
}

/** Header reusable: badge + título + subtítulo sobre un wash azul claro. */
function header({ badge, title, subtitle, titleSize = 72 }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex', flexDirection: 'column', padding: '58px 56px 30px 56px',
        background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 70%)',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', alignSelf: 'flex-start', backgroundColor: ACCENT, color: '#fff',
              fontSize: '22px', fontWeight: 700, padding: '8px 18px', borderRadius: '999px',
              marginBottom: '20px', letterSpacing: '0.04em',
            },
            children: badge,
          },
        },
        txt(title, { size: titleSize, weight: 800, color: INK }),
        txt(subtitle, { size: 30, weight: 400, color: MUTED }),
      ],
    },
  };
}

/** Footer reusable: marca + dominio + año/fuente + CTA. */
function footer({ source, cta }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 'auto', padding: '26px 56px', backgroundColor: INK,
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: [
              txt('Hacé Cuentas', { size: 34, weight: 800, color: '#fff' }),
              txt('hacecuentas.com · ' + source, { size: 22, weight: 400, color: '#93c5fd' }),
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', backgroundColor: ACCENT, color: '#fff', fontSize: '24px', fontWeight: 700,
              padding: '15px 24px', borderRadius: '14px', alignItems: 'center',
            },
            children: cta,
          },
        },
      ],
    },
  };
}

async function renderPng(template) {
  const fonts = await loadFonts();
  const svg = await satori(template, { width: W, height: H, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: W }, font: { loadSystemFonts: false } })
    .render().asPng();
}

// ===========================================================================
// DATASET 1 — Monotributo 2026
// ===========================================================================
function buildMonotributo() {
  const { CATEGORIAS, TOPES, CUOTA_SERVICIOS, CUOTA_BIENES, META } = mono;
  const COLS = [120, 408, 222, 222]; // suma 972 (1080 - 108 padding lateral)

  function row(cells, { bg = '#ffffff', borderTop } = {}) {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex', flexDirection: 'row', alignItems: 'center',
          height: '78px', paddingLeft: '14px', paddingRight: '14px', backgroundColor: bg,
          ...(borderTop ? { borderTop: `1px solid ${borderTop}` } : {}),
        },
        children: cells,
      },
    };
  }

  const headerRow = row([
    txt('Cat.', { size: 21, weight: 700, color: '#fff', width: COLS[0] }),
    txt('Tope anual hasta', { size: 21, weight: 700, color: '#fff', width: COLS[1] }),
    txt('Cuota servicios', { size: 20, weight: 700, color: '#fff', width: COLS[2], align: 'right' }),
    txt('Cuota bienes', { size: 20, weight: 700, color: '#fff', width: COLS[3], align: 'right' }),
  ], { bg: INK });

  const dataRows = CATEGORIAS.map((cat, i) => row([
    {
      type: 'div',
      props: {
        style: { display: 'flex', width: `${COLS[0]}px`, alignItems: 'center', justifyContent: 'flex-start' },
        children: {
          type: 'div',
          props: {
            style: {
              display: 'flex', width: '52px', height: '52px', borderRadius: '12px',
              backgroundColor: `${ACCENT}14`, color: ACCENT, fontSize: '28px', fontWeight: 800,
              alignItems: 'center', justifyContent: 'center',
            },
            children: cat,
          },
        },
      },
    },
    txt('$' + fmtMillon(TOPES[cat]), { size: 27, weight: 600, color: INK, width: COLS[1] }),
    txt('$' + fmtMillon(CUOTA_SERVICIOS[cat]), { size: 26, weight: 700, color: ACCENT, width: COLS[2], align: 'right' }),
    txt('$' + fmtMillon(CUOTA_BIENES[cat]), { size: 26, weight: 700, color: INK, width: COLS[3], align: 'right' }),
  ], { bg: i % 2 === 0 ? '#f8fafc' : '#ffffff', borderTop: '#e2e8f0' }));

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex', flexDirection: 'column', width: `${W}px`, height: `${H}px`,
        backgroundColor: '#ffffff', fontFamily: 'Inter',
      },
      children: [
        header({
          badge: 'ACTUALIZADO · 2026 · ' + META.fuente,
          title: 'Monotributo 2026',
          subtitle: 'Categorías, topes y cuotas mensuales (A–K)',
          titleSize: 74,
        }),
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', padding: '8px 56px 0 56px' },
            children: [headerRow, ...dataRows],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', padding: '16px 56px 0 56px', fontSize: '21px', color: '#64748b' },
            children: 'La cuota incluye impuesto integrado + SIPA (jubilación) + obra social. Topes y cuotas iguales en ingresos; servicios paga más en las categorías altas.',
          },
        },
        footer({ source: 'fuente: ' + META.fuente, cta: 'Calculá tu categoría →' }),
      ],
    },
  };
}

// ===========================================================================
// DATASET 2 — Feriados Argentina 2026
// ===========================================================================
function buildFeriados() {
  const { FERIADOS_AR_2026, META, formatFecha, tipoLabel } = feri;
  // 19 entradas → 2 columnas para que entren sin apretar en 1350px de alto.
  const items = FERIADOS_AR_2026;
  const mid = Math.ceil(items.length / 2);
  const left = items.slice(0, mid);
  const right = items.slice(mid);

  // Color del chip por tipo de feriado (señal visual rápida).
  const TIPO_COLOR = {
    inamovible: '#2563eb',
    trasladable: '#0891b2',
    puente: '#ea580c',
    'no-laborable': '#7c3aed',
  };

  function feriadoRow(f) {
    const color = TIPO_COLOR[f.tipo] || MUTED;
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex', flexDirection: 'column', paddingTop: '11px', paddingBottom: '11px',
          borderBottom: '1px solid #e2e8f0',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex', width: '8px', height: '8px', borderRadius: '8px',
                      backgroundColor: color, marginRight: '10px', flexShrink: 0,
                    },
                  },
                },
                txt(capitalize(formatFecha(f.fecha)), { size: 22, weight: 700, color: INK }),
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: '18px', marginTop: '2px' },
              children: [
                txt(truncate(f.nombre, 42), { size: 19, weight: 400, color: MUTED, grow: true }),
              ],
            },
          },
        ],
      },
    };
  }

  function column(rows) {
    return {
      type: 'div',
      props: {
        style: { display: 'flex', flexDirection: 'column', width: '472px' },
        children: rows.map(feriadoRow),
      },
    };
  }

  const nationalCount = items.filter((f) => f.tipo === 'inamovible' || f.tipo === 'trasladable').length;
  const puentesCount = items.filter((f) => f.tipo === 'puente').length;

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex', flexDirection: 'column', width: `${W}px`, height: `${H}px`,
        backgroundColor: '#ffffff', fontFamily: 'Inter',
      },
      children: [
        header({
          badge: 'CALENDARIO ' + META.anio + ' · ' + (items.length) + ' FECHAS',
          title: 'Feriados Argentina 2026',
          subtitle: nationalCount + ' feriados nacionales + ' + puentesCount + ' puentes turísticos',
          titleSize: 68,
        }),
        // Leyenda de tipos
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'row', padding: '4px 56px 14px 56px', flexWrap: 'wrap' },
            children: [
              legendChip('Inamovible', TIPO_COLOR.inamovible),
              legendChip('Trasladable', TIPO_COLOR.trasladable),
              legendChip('Puente turístico', TIPO_COLOR.puente),
              legendChip('No laborable', TIPO_COLOR['no-laborable']),
            ],
          },
        },
        // Dos columnas
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'row', padding: '0 56px', justifyContent: 'space-between' },
            children: [column(left), column(right)],
          },
        },
        footer({ source: 'Ley 27.399 + Res. 164/2025', cta: 'Ver calendario →' }),
      ],
    },
  };
}

function legendChip(label, color) {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginRight: '22px' },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', width: '12px', height: '12px', borderRadius: '12px', backgroundColor: color, marginRight: '7px' },
          },
        },
        txt(label, { size: 19, weight: 600, color: MUTED }),
      ],
    },
  };
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function truncate(s, max) {
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + '…';
}

// ===========================================================================
// Main
// ===========================================================================
async function main() {
  const started = Date.now();
  const jobs = [
    { name: 'infografia-monotributo-2026.png', build: buildMonotributo },
    { name: 'infografia-feriados-argentina-2026.png', build: buildFeriados },
  ];
  for (const job of jobs) {
    const png = await renderPng(job.build());
    const outPath = join(OUT_DIR, job.name);
    writeFileSync(outPath, png);
    console.log(`✓ ${job.name} (${(png.length / 1024).toFixed(0)} KB, ${W}×${H})`);
  }
  console.log(`[infografias] done in ${((Date.now() - started) / 1000).toFixed(2)}s`);
}

main().catch((err) => {
  console.error('[infografias] fatal error:', err);
  process.exit(1);
});
