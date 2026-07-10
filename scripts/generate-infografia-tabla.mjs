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
  {
    out: 'recargo-dominical-festivo-colombia-2026-tabla',
    accent: '#b8860b',
    badge: 'ACTUALIZADO · 2026 · COLOMBIA',
    title: 'Recargo Dominical y Festivo',
    subtitle: 'Colombia 2026 — Ley 2466 de 2025 (sube al 100 % en 2027)',
    cols: [
      { label: 'Concepto', width: 600, align: 'left', wrap: true },
      { label: 'Recargo', width: 322, align: 'right' },
    ],
    rows: [
      ['Dominical/festivo (hasta jun 2026)', '+80 %'],
      ['Dominical/festivo (desde jul 2026)', '+90 %'],
      ['Dominical/festivo (desde 2027)', '+100 %'],
      ['Recargo nocturno (19–06 h)', '+35 %'],
      ['Domingo de 8 h con mínimo (jun)', '$114.605'],
      ['Domingo de 8 h con mínimo (jul)', '$126.732'],
    ],
    rowH: 104,
    nota: 'Sobre la hora ordinaria. Salario mínimo 2026 = $1.750.905; divisor 220 (210 desde el 15/7/2026 por la jornada de 42 h). Fuente: CST + Ley 2466 de 2025.',
    cta: 'Calculá tu dominical →',
  },
  {
    out: 'horas-extras-colombia-2026-recargos-tabla',
    accent: '#0e7c5a',
    badge: 'ACTUALIZADO · 2026 · COLOMBIA',
    title: 'Horas Extras en Colombia',
    subtitle: 'Recargos 2026 y valor con salario mínimo ($1.750.905)',
    cols: [
      { label: 'Tipo de hora', width: 520, align: 'left', wrap: true },
      { label: 'Recargo', width: 190, align: 'center' },
      { label: 'Con mínimo', width: 212, align: 'right' },
    ],
    rows: [
      ['Hora ordinaria (÷220)', '—', '$7.959'],
      ['Extra diurna', '+25 %', '$9.948'],
      ['Extra nocturna (7 p.m.–6 a.m.)', '+75 %', '$13.928'],
      ['Extra diurna desde 15/7 (÷210)', '+25 %', '$10.422'],
      ['Extra nocturna desde 15/7', '+75 %', '$14.591'],
    ],
    rowH: 104,
    nota: 'Desde el 15/7/2026 la jornada baja a 42 h/semana (divisor 210): cada hora extra vale 4,76 % más. Fuente: CST arts. 159-168 + Ley 2101 de 2021.',
    cta: 'Calculá tus horas extras →',
  },
  {
    out: 'salario-minimo-paraguay-2026-jornal-hora-tabla',
    accent: '#c0392b',
    badge: 'ACTUALIZADO · 2026 · PARAGUAY',
    title: 'Salario Mínimo Paraguay',
    subtitle: '2026 — vigente desde el 1 de julio · Decreto N° 6225 (+5 %)',
    cols: [
      { label: 'Concepto', width: 600, align: 'left', wrap: true },
      { label: 'Monto', width: 322, align: 'right' },
    ],
    rows: [
      ['Mensual (SMVM)', 'Gs. 3.044.000'],
      ['Jornal (÷30)', 'Gs. 101.467'],
      ['Hora (÷240)', 'Gs. 12.683'],
      ['Jornal mínimo a destajo', 'Gs. 117.077'],
      ['Recargo nocturno (20–06 h)', '+30 %'],
      ['Anterior (hasta jun 2026)', 'Gs. 2.899.048'],
    ],
    rowH: 104,
    nota: 'Fijado por el Decreto N° 6225 (reajuste del 5 %), vigente desde el 1/7/2026. Fuente: MTESS Paraguay.',
    cta: 'Calculá tu jornal →',
  },
  {
    out: 'prima-antiguedad-mexico-2026-art-162-tabla',
    accent: '#0e7c5a',
    badge: 'ACTUALIZADO · 2026 · MÉXICO',
    title: 'Prima de Antigüedad',
    subtitle: 'México 2026 — LFT Art. 162 (finiquito y liquidación)',
    cols: [
      { label: 'Concepto', width: 560, align: 'left', wrap: true },
      { label: 'Valor', width: 362, align: 'right' },
    ],
    rows: [
      ['Monto', '12 días/año'],
      ['Tope diario — zona general', '$630.08/día'],
      ['Tope diario — frontera norte', '$881.74/día'],
      ['Base del tope', '2 × SMG diario'],
      ['Antigüedad mínima (renuncia)', '15 años'],
    ],
    rowH: 104,
    nota: 'Equivale a 12 días de salario por año, con tope de 2 SMG diario (LFT Art. 162). Aplica en despido, renuncia con 15+ años o incapacidad. Fuente: Ley Federal del Trabajo.',
    cta: 'Calculá tu prima →',
  },
  {
    out: 'salario-diario-integrado-sdi-2026-mexico-tabla',
    accent: '#7c3aed',
    badge: 'ACTUALIZADO · 2026 · IMSS',
    title: 'Salario Diario Integrado (SDI)',
    subtitle: 'México 2026 — SDI / SBC para IMSS e INFONAVIT',
    cols: [
      { label: 'Concepto', width: 560, align: 'left', wrap: true },
      { label: 'Valor', width: 362, align: 'right' },
    ],
    rows: [
      ['Factor de integración (1er año)', '1.0493'],
      ['Fórmula', 'Salario × factor'],
      ['Ejemplo: $500/día', 'SDI $524.65'],
      ['SBC máximo (IMSS)', '$2.932.75/día'],
      ['Tope del SBC', '25 UMA'],
    ],
    rowH: 104,
    nota: 'El factor suma la parte proporcional del aguinaldo (15 días) y la prima vacacional (25 % de 12 días). Sube con la antigüedad. Fuente: LSS + LFT.',
    cta: 'Calculá tu SDI →',
  },
  {
    out: 'sancion-extemporaneidad-dian-2026-tabla',
    accent: '#c0392b',
    badge: 'ACTUALIZADO · 2026 · DIAN',
    title: 'Sanción por Extemporaneidad',
    subtitle: 'Colombia 2026 — declarar renta tarde (DIAN)',
    cols: [
      { label: 'Situación', width: 520, align: 'left', wrap: true },
      { label: 'Sanción', width: 402, align: 'right' },
    ],
    rows: [
      ['Antes de emplazamiento (art. 641)', '5 % mensual'],
      ['Tope sin emplazamiento', '100 %'],
      ['Con emplazamiento (art. 642)', '10 % mensual'],
      ['Tope con emplazamiento', '200 %'],
      ['Sanción mínima', '$523.740 (10 UVT)'],
    ],
    rowH: 104,
    nota: 'El porcentaje se calcula sobre el impuesto a cargo, por cada mes o fracción de retraso, y nunca baja de la sanción mínima. Fuente: Estatuto Tributario, arts. 641-642.',
    cta: 'Calculá tu sanción →',
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
              txt(cfg.title, { size: 76, weight: 800, color: INK, width: W - 78, wrap: true }),
              txt(cfg.subtitle, { size: 28, weight: 400, color: '#475569', width: W - 78, wrap: true }),
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
