/**
 * Generador genérico de infografías de tabla (vertical 2:3) para Bing Images +
 * Pinterest. Igual filosofía que generate-infografia-monotributo.mjs: satori
 * (HTML/CSS → SVG → PNG), NO IA, porque los montos fiscales tienen que ser exactos.
 *
 * Nombre de archivo keyword-rich = señal de ranking en Bing Images.
 *
 * Cada infografía se define en CONFIGS[]. Datos verificados contra fuente oficial
 * (citada en `nota`). Output: public/img/<out>.png
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

// ── Infografías a generar ────────────────────────────────────────────────────
const CONFIGS = [
  {
    out: 'tramos-irpf-2026-espana-tabla-aeat',
    accent: '#c0392b',
    badge: 'ACTUALIZADO · 2026 · AEAT',
    title: 'Tramos del IRPF 2026',
    subtitle: 'Escala estatal en España — a cada tramo se suma el autonómico',
    cols: [
      { label: 'Base imponible (€)', width: 560, align: 'left' },
      { label: 'Tipo estatal', width: 362, align: 'right' },
    ],
    rows: [
      ['Hasta 12.450 €', '9,5 %'],
      ['12.450 – 20.200 €', '12 %'],
      ['20.200 – 35.200 €', '15 %'],
      ['35.200 – 60.000 €', '18,5 %'],
      ['60.000 – 300.000 €', '22,5 %'],
      ['Más de 300.000 €', '24,5 %'],
    ],
    rowH: 96,
    nota: 'Tipos estatales (la mitad de la tarifa). El tipo total suma el gravamen autonómico de tu comunidad (Madrid bajo; Cataluña y C. Valenciana altos).',
    cta: 'Calculá tu retención →',
  },
  {
    out: 'tasas-isn-2026-mexico-por-estado-tabla',
    accent: '#0e7c5a',
    badge: 'ACTUALIZADO · 2026 · MÉXICO',
    title: 'Tasas del ISN 2026',
    subtitle: 'Impuesto Sobre Nóminas por estado — lo paga el patrón',
    cols: [
      { label: 'Tasa', width: 150, align: 'left' },
      { label: 'Estados', width: 772, align: 'left', wrap: true },
    ],
    rows: [
      ['3,0 %', 'CDMX, Edo. de México, Nuevo León, Puebla, Veracruz, Quintana Roo, Tamaulipas, Chihuahua, Michoacán, Oaxaca, Campeche, Tlaxcala'],
      ['2,5 %', 'Querétaro, San Luis Potosí, Yucatán, Tabasco, Hidalgo, Zacatecas, Baja California Sur'],
      ['2,0 %', 'Jalisco, Guanajuato, Sonora, Coahuila, Guerrero, Chiapas, Morelos, Durango, Colima, Nayarit'],
      ['1,8 %', 'Baja California'],
      ['1,5 %', 'Aguascalientes'],
    ],
    rowH: 150,
    nota: 'El ISN lo paga el patrón sobre el total de la nómina mensual. La tasa la fija cada estado. Sinaloa 2,4 %.',
    cta: 'Calculá el ISN →',
  },
];

function txt(text, { size = 26, weight = 400, color = INK, align = 'left', width, grow, wrap } = {}) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex', fontSize: `${size}px`, fontWeight: weight, color,
        justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        alignItems: 'center', lineHeight: 1.25,
        ...(width ? { width: `${width}px` } : {}), ...(grow ? { flexGrow: 1 } : {}),
        whiteSpace: wrap ? 'normal' : 'nowrap',
      },
      children: text,
    },
  };
}

function buildTemplate(cfg) {
  const { accent } = cfg;
  const headerRow = {
    type: 'div',
    props: {
      style: {
        display: 'flex', flexDirection: 'row', alignItems: 'center', height: '64px',
        paddingLeft: '14px', paddingRight: '14px', backgroundColor: INK,
      },
      children: cfg.cols.map((c) =>
        txt(c.label, { size: 23, weight: 700, color: '#fff', width: c.width, align: c.align })
      ),
    },
  };
  const dataRows = cfg.rows.map((r, i) => ({
    type: 'div',
    props: {
      style: {
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        minHeight: `${cfg.rowH}px`, paddingTop: '12px', paddingBottom: '12px',
        paddingLeft: '14px', paddingRight: '14px',
        backgroundColor: i % 2 === 0 ? '#f8fafc' : '#ffffff', borderTop: '1px solid #e2e8f0',
      },
      children: cfg.cols.map((c, ci) => {
        const isFirst = ci === 0;
        return txt(r[ci], {
          size: isFirst ? 30 : 27,
          weight: isFirst ? 800 : 500,
          color: isFirst ? accent : INK,
          width: c.width, align: c.align, wrap: c.wrap,
        });
      }),
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
                  children: cfg.badge,
                },
              },
              txt(cfg.title, { size: 76, weight: 800, color: INK }),
              txt(cfg.subtitle, { size: 28, weight: 400, color: '#475569', wrap: true }),
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
        {
          type: 'div',
          props: {
            style: { display: 'flex', padding: '18px 39px 0 39px', fontSize: '21px', color: '#64748b' },
            children: cfg.nota,
          },
        },
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
                  children: cfg.cta,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

for (const cfg of CONFIGS) {
  const svg = await satori(buildTemplate(cfg), {
    width: W, height: H,
    fonts: [
      { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
      { name: 'Inter', data: interBold, weight: 800, style: 'normal' },
      { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
      { name: 'Inter', data: interRegular, weight: 500, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  const outPath = join(OUT_DIR, `${cfg.out}.png`);
  writeFileSync(outPath, png);
  console.log('✓', `${cfg.out}.png`, `(${(png.length / 1024).toFixed(0)} KB)`);
}
