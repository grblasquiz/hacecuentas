/**
 * Genera una infografía vertical (2:3) de la tabla Monotributo 2026 para
 * Pinterest + Bing Images. Datos = escala ARCA vigente JUNIO 2026 (+14,3%),
 * validados contra 2 fuentes (Estudio Brady + Ámbito), junio 2026.
 *
 * Por qué satori y no IA: los modelos de imagen inventan los números. Una
 * infografía fiscal exige montos exactos → HTML/CSS → SVG → PNG.
 *
 * Detalle fiscal: categorías I, J, K son EXCLUSIVAS de venta de bienes
 * (prestadores de servicios topean en H) → servicios = "—" en esas filas.
 *
 * Output: public/img/tabla-monotributo-2026-categorias-cuotas.png
 * Nombre de archivo keyword-rich = señal de ranking en Bing Images.
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
const ACCENT = '#2563eb';
const INK = '#0f172a';

// [categoría, tope facturación anual, cuota servicios, cuota venta de bienes]
// Redondeo a peso entero. "—" = no aplica (I,J,K son solo venta de bienes).
const DATA = [
  ['A', '10.277.988', '42.387', '42.387'],
  ['B', '15.058.448', '48.251', '48.251'],
  ['C', '21.113.697', '56.502', '55.227'],
  ['D', '26.212.853', '72.414', '70.661'],
  ['E', '30.833.964', '102.538', '92.658'],
  ['F', '38.642.048', '129.045', '111.198'],
  ['G', '46.211.109', '197.108', '135.918'],
  ['H', '70.113.407', '447.347', '272.063'],
  ['I', '78.479.212', '—', '406.512'],
  ['J', '89.872.640', '—', '497.059'],
  ['K', '108.357.084', '—', '600.880'],
];

const COLS = [110, 360, 226, 226]; // suma 922 (≈ 1000 - 78 padding)

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

function row(cells, { bg = '#ffffff', borderTop } = {}) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        height: '78px', paddingLeft: '14px', paddingRight: '14px',
        backgroundColor: bg,
        ...(borderTop ? { borderTop: `1px solid ${borderTop}` } : {}),
      },
      children: cells,
    },
  };
}

const headerRow = row([
  txt('Cat.', { size: 21, weight: 700, color: '#fff', width: COLS[0] }),
  txt('Facturación anual hasta', { size: 21, weight: 700, color: '#fff', width: COLS[1] }),
  txt('Servicios', { size: 21, weight: 700, color: '#fff', width: COLS[2], align: 'right' }),
  txt('Bienes', { size: 21, weight: 700, color: '#fff', width: COLS[3], align: 'right' }),
], { bg: INK });

const dataRows = DATA.map((r, i) => row([
  {
    type: 'div',
    props: {
      style: {
        display: 'flex', width: `${COLS[0]}px`, alignItems: 'center', justifyContent: 'flex-start',
      },
      children: {
        type: 'div',
        props: {
          style: {
            display: 'flex', width: '52px', height: '52px', borderRadius: '12px',
            backgroundColor: `${ACCENT}14`, color: ACCENT, fontSize: '28px', fontWeight: 800,
            alignItems: 'center', justifyContent: 'center',
          },
          children: r[0],
        },
      },
    },
  },
  txt('$' + r[1], { size: 27, weight: 600, color: INK, width: COLS[1] }),
  txt(r[2] === '—' ? '—' : '$' + r[2], { size: 27, weight: 700, color: r[2] === '—' ? '#94a3b8' : ACCENT, width: COLS[2], align: 'right' }),
  txt(r[3] === '—' ? '—' : '$' + r[3], { size: 27, weight: 700, color: INK, width: COLS[3], align: 'right' }),
], { bg: i % 2 === 0 ? '#f8fafc' : '#ffffff', borderTop: '#e2e8f0' }));

const template = {
  type: 'div',
  props: {
    style: {
      display: 'flex', flexDirection: 'column', width: `${W}px`, height: `${H}px`,
      backgroundColor: '#ffffff', fontFamily: 'Inter',
    },
    children: [
      // Header
      {
        type: 'div',
        props: {
          style: {
            display: 'flex', flexDirection: 'column', padding: '54px 39px 30px 39px',
            background: `linear-gradient(135deg, #eff6ff 0%, #ffffff 70%)`,
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex', alignSelf: 'flex-start', backgroundColor: ACCENT, color: '#fff',
                  fontSize: '22px', fontWeight: 700, padding: '8px 18px', borderRadius: '999px',
                  marginBottom: '20px',
                },
                children: 'ACTUALIZADO · JUNIO 2026 · ARCA',
              },
            },
            txt('Monotributo 2026', { size: 76, weight: 800, color: INK }),
            txt('Categorías, topes de facturación y cuota mensual', { size: 30, weight: 400, color: '#475569' }),
          ],
        },
      },
      // Tabla
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column', padding: '8px 39px 0 39px' },
          children: [headerRow, ...dataRows],
        },
      },
      // Nota fiscal
      {
        type: 'div',
        props: {
          style: {
            display: 'flex', padding: '16px 39px 0 39px', fontSize: '21px', color: '#64748b',
          },
          children: 'Categorías I · J · K: exclusivas para venta de bienes. La cuota incluye impuesto + SIPA + obra social.',
        },
      },
      // Footer / marca
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
                  display: 'flex', backgroundColor: ACCENT, color: '#fff', fontSize: '25px', fontWeight: 700,
                  padding: '16px 26px', borderRadius: '14px', alignItems: 'center',
                },
                children: 'Calculá tu categoría →',
              },
            },
          ],
        },
      },
    ],
  },
};

const svg = await satori(template, {
  width: W, height: H,
  fonts: [
    { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
    { name: 'Inter', data: interBold, weight: 800, style: 'normal' },
    { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
    { name: 'Inter', data: interRegular, weight: 600, style: 'normal' },
  ],
});
const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
const outPath = join(OUT_DIR, 'tabla-monotributo-2026-categorias-cuotas.png');
writeFileSync(outPath, png);
console.log('✓ Infografía generada:', outPath, `(${(png.length / 1024).toFixed(0)} KB)`);
