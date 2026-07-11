/**
 * Generador BATCH de infografías de tabla (vertical 2:3, 1000×1500) para Bing
 * Images + Pinterest, a partir de las referenceTables que YA viven en el JSON
 * de cada calc. Misma filosofía y template que generate-infografia-tabla.mjs
 * (satori → resvg, NO IA: los montos tienen que ser exactos), pero data-driven:
 * los headers/rows/note se leen del calc en tiempo de generación, así la imagen
 * nunca se desincroniza de la tabla publicada — re-correr el script regenera.
 *
 * Entradas: scripts/infografias-reftables-entries.json
 *   { dir, slug, tableIdx, out, badge, accent, title, subtitle, cta, alt, caption }
 * Output:   public/img/<out>.png  (nombre keyword-rich = señal de ranking Bing)
 *
 * El campo `infographic` del JSON del calc se agrega en un paso aparte (no acá)
 * para no reformatear los JSON de contenido.
 *
 * Uso: node scripts/generate-infografias-reftables.mjs
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FONTS_DIR = join(__dirname, 'fonts');
const OUT_DIR = join(ROOT, 'public', 'img');
mkdirSync(OUT_DIR, { recursive: true });

const interBold = readFileSync(join(FONTS_DIR, 'Inter-Bold.ttf'));
const interRegular = readFileSync(join(FONTS_DIR, 'Inter-Regular.ttf'));

const W = 1000, H = 1500;
const INK = '#0f172a';
const INNER = W - 78;      // 922: ancho útil dentro del padding lateral de 39
const ROW_INNER = INNER - 28; // 894: dentro del padding 14 de cada fila

const ENTRIES = JSON.parse(readFileSync(join(__dirname, 'infografias-reftables-entries.json'), 'utf8'));

// ── Estimación de layout (para que TODO entre en el lienzo fijo de 1500px) ──
// Ancho promedio de glifo Inter ≈ 0.55×size (regular) / 0.60×size (bold).
// Sobreestimar es seguro: predice más líneas de las reales → más aire, nunca clipping.
const estW = (text, size, weight) => String(text).length * size * (weight >= 700 ? 0.60 : 0.55);
const linesFor = (text, width, size, weight) => Math.max(1, Math.ceil(estW(text, size, weight) / width));

// Inter no tiene glifos emoji (banderas, dingbats) → satori renderiza tofu. Se limpian.
const deEmoji = (s) => String(s)
  .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2B00}-\u{2BFF}]/gu, '')
  .replace(/\s{2,}/g, ' ')
  .trim();

const GAP = 12; // separación horizontal entre columnas

function computeLayout(table, entry) {
  const headers = table.headers.map(deEmoji);
  const rows = table.rows.map((r) => r.map(deEmoji));
  const n = headers.length;
  const avail = ROW_INNER - GAP * (n - 1);

  // Anchos de columna proporcionales al contenido (p95 aprox = max), con piso.
  const maxLens = headers.map((h, i) => Math.max(String(h).length, ...rows.map((r) => String(r[i]).length)));
  const weights = maxLens.map((l) => Math.pow(Math.max(l, 4), 0.85));
  const wSum = weights.reduce((a, b) => a + b, 0);
  let widths = weights.map((w) => Math.max(96, Math.round((w / wSum) * avail)));
  // renormalizar al ancho disponible
  const diff = avail - widths.reduce((a, b) => a + b, 0);
  widths[widths.indexOf(Math.max(...widths))] += diff;

  const aligns = headers.map((_, i) => (i === 0 ? 'left' : i === n - 1 ? 'right' : 'center'));

  // Tamaños base según cantidad de columnas; se reducen si no entra.
  let f1 = n <= 3 ? 29 : 25; // primera columna (bold, acento)
  let f2 = n <= 3 ? 26 : 23; // resto
  let rowPad = 22;
  let nota = deEmoji(table.note || '');
  if (nota.length > 210) {
    const cut = nota.slice(0, 207);
    const lastDot = cut.lastIndexOf('. ');
    nota = lastDot > 100 ? cut.slice(0, lastDot + 1) : cut.replace(/\s+\S*$/, '') + '…';
  }

  const titleSize = entry.title.length <= 24 ? 68 : entry.title.length <= 34 ? 58 : 50;

  for (let attempt = 0; attempt < 8; attempt++) {
    const rowHs = rows.map((r) => {
      let maxCell = 0;
      r.forEach((cell, i) => {
        const size = i === 0 ? f1 : f2;
        const weight = i === 0 ? 800 : 500;
        const l = linesFor(cell, widths[i] - 6, size, weight);
        maxCell = Math.max(maxCell, l * size * 1.3);
      });
      return Math.max(60, Math.round(maxCell + rowPad));
    });
    const headerLines = Math.max(...headers.map((h, i) => linesFor(h, widths[i] - 6, 22, 700)));
    const tableHeaderH = Math.max(64, headerLines * 22 * 1.3 + 20);
    const titleH = linesFor(entry.title, INNER, titleSize, 800) * titleSize * 1.18;
    const subH = linesFor(entry.subtitle, INNER, 27, 400) * 27 * 1.35;
    const headerBlock = 54 + 58 + titleH + 8 + subH + 28; // padding + badge + título + subtítulo
    const notaH = nota ? 18 + linesFor(nota, INNER, 21, 400) * 21 * 1.35 : 0;
    const total = headerBlock + 14 + tableHeaderH + rowHs.reduce((a, b) => a + b, 0) + notaH + 134 + 20;

    if (total <= H) {
      // Redistribuir el aire sobrante en las filas (tablas cortas quedan más llenas).
      const slack = H - total;
      if (slack > 120) {
        const add = Math.min(Math.floor(slack / rowHs.length), 46);
        for (let i = 0; i < rowHs.length; i++) rowHs[i] += add;
      }
      return { headers, rows, widths, aligns, f1, f2, rowHs, tableHeaderH, nota, titleSize, fits: true };
    }
    // no entra: achicar tipografía de celdas, después la nota
    if (f1 > 20) { f1 = Math.max(20, Math.round(f1 * 0.92)); f2 = Math.max(18, Math.round(f2 * 0.92)); rowPad = Math.max(14, rowPad - 2); continue; }
    if (nota.length > 120) { nota = nota.slice(0, 117).replace(/\s+\S*$/, '') + '…'; continue; }
    return { fits: false };
  }
  return { fits: false };
}

// ── Template (mismo look & feel que generate-infografia-tabla.mjs) ──────────
function txt(text, { size = 26, weight = 400, color = INK, align = 'left', width } = {}) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex', fontSize: `${size}px`, fontWeight: weight, color,
        justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        alignItems: 'center', lineHeight: 1.28, whiteSpace: 'normal',
        ...(width ? { width: `${width}px` } : {}),
      },
      children: String(text),
    },
  };
}

function buildTemplate(entry, L) {
  const accent = entry.accent;
  const headerRow = {
    type: 'div',
    props: {
      style: {
        display: 'flex', flexDirection: 'row', alignItems: 'center', minHeight: `${L.tableHeaderH}px`,
        paddingLeft: '14px', paddingRight: '14px', backgroundColor: INK, gap: `${GAP}px`,
      },
      children: L.headers.map((h, i) =>
        txt(h, { size: 22, weight: 700, color: '#fff', width: L.widths[i], align: L.aligns[i] })
      ),
    },
  };
  const dataRows = L.rows.map((r, i) => ({
    type: 'div',
    props: {
      style: {
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        minHeight: `${L.rowHs[i]}px`, paddingTop: '10px', paddingBottom: '10px',
        paddingLeft: '14px', paddingRight: '14px', gap: `${GAP}px`,
        backgroundColor: i % 2 === 0 ? '#f8fafc' : '#ffffff', borderTop: '1px solid #e2e8f0',
      },
      children: L.headers.map((_, ci) =>
        txt(r[ci], {
          size: ci === 0 ? L.f1 : L.f2,
          weight: ci === 0 ? 800 : 500,
          color: ci === 0 ? accent : INK,
          width: L.widths[ci], align: L.aligns[ci],
        })
      ),
    },
  }));

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex', flexDirection: 'column', width: `${W}px`, height: `${H}px`,
        backgroundColor: '#ffffff', fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', flexDirection: 'column', padding: '54px 39px 28px 39px',
              background: `linear-gradient(135deg, ${accent}14 0%, #ffffff 70%)`,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex', alignSelf: 'flex-start', backgroundColor: accent, color: '#fff',
                    fontSize: '22px', fontWeight: 700, padding: '8px 18px', borderRadius: '999px',
                    marginBottom: '20px',
                  },
                  children: entry.badge,
                },
              },
              txt(entry.title, { size: L.titleSize, weight: 800, color: INK, width: INNER }),
              { type: 'div', props: { style: { display: 'flex', height: '8px' } } },
              txt(entry.subtitle, { size: 27, weight: 400, color: '#475569', width: INNER }),
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', padding: '14px 39px 0 39px' },
            children: [headerRow, ...dataRows],
          },
        },
        ...(L.nota
          ? [{
              type: 'div',
              props: {
                style: { display: 'flex', padding: '18px 39px 0 39px', fontSize: '21px', color: '#64748b', lineHeight: 1.35 },
                children: L.nota,
              },
            }]
          : []),
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 'auto', padding: '28px 39px', backgroundColor: INK,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    txt('Hacé Cuentas', { size: 34, weight: 800, color: '#fff' }),
                    txt('hacecuentas.com', { size: 24, weight: 400, color: '#93c5fd' }),
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex', backgroundColor: accent, color: '#fff', fontSize: '25px', fontWeight: 700,
                    padding: '16px 26px', borderRadius: '14px', alignItems: 'center',
                  },
                  children: entry.cta,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────
const results = [];
for (const entry of ENTRIES) {
  const jsonPath = join(ROOT, 'src', 'content', entry.dir, `${entry.slug}.json`);
  let table;
  try {
    const calc = JSON.parse(readFileSync(jsonPath, 'utf8'));
    table = calc.referenceTables?.[entry.tableIdx];
    if (!table?.headers?.length || !table?.rows?.length) throw new Error('tabla vacía o inexistente');
  } catch (err) {
    console.log('✗ SKIP', entry.slug, '—', err.message);
    results.push({ ...entry, ok: false, reason: err.message });
    continue;
  }

  const L = computeLayout(table, entry);
  if (!L.fits) {
    console.log('✗ SKIP', entry.slug, '— tabla no entra en 1000×1500 ni con tipografía mínima');
    results.push({ ...entry, ok: false, reason: 'overflow: no entra en el lienzo' });
    continue;
  }

  const svg = await satori(buildTemplate(entry, L), {
    width: W, height: H,
    fonts: [
      { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
      { name: 'Inter', data: interBold, weight: 800, style: 'normal' },
      { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
      { name: 'Inter', data: interRegular, weight: 500, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  writeFileSync(join(OUT_DIR, `${entry.out}.png`), png);
  const kb = Math.round(png.length / 1024);
  console.log('✓', `${entry.out}.png`, `(${kb} KB)`);
  results.push({ ...entry, ok: true, kb });
}

const outManifest = join(__dirname, '..', 'reports', 'infografias-reftables-manifest.json');
writeFileSync(outManifest, JSON.stringify(results, null, 1));
const ok = results.filter((r) => r.ok).length;
console.log(`\n${ok}/${results.length} generadas · manifest: ${outManifest}`);
