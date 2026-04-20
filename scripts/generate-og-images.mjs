/**
 * Genera OG images dinámicas por página al build.
 *
 * Genera PNG 1200×630 con template:
 *   - Fondo con gradiente
 *   - Logo + brand
 *   - Título grande de la página
 *   - Subtítulo (categoría o eyebrow)
 *   - Badge de "calculadora gratis"
 *
 * Solo para páginas top (home, guías, categorías, páginas especiales, top 50 calcs).
 * Las demás calcs usan og-default.png — incluso con 2000 calcs, generar 2000 OG
 * imágenes al build agrega ~5 min y 60MB de disco, innecesario para long tail.
 *
 * Output: public/og/{slug}.png
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FONTS_DIR = join(__dirname, 'fonts');
const OUT_DIR = join(ROOT, 'public', 'og');

mkdirSync(OUT_DIR, { recursive: true });

const interBold = readFileSync(join(FONTS_DIR, 'Inter-Bold.ttf'));
const interRegular = readFileSync(join(FONTS_DIR, 'Inter-Regular.ttf'));

/** Renderiza un JSX-like para Satori. */
function template({ title, eyebrow, accent = '#2563eb' }) {
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: `linear-gradient(135deg, #ffffff 0%, #eff6ff 55%, ${accent}18 100%)`,
        fontFamily: 'Inter',
        position: 'relative',
      },
      children: [
        // Top bar: logo + brand
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '16px' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '56px', height: '56px', borderRadius: '14px',
                    background: accent, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '30px', fontWeight: 800,
                  },
                  children: 'H',
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '30px', fontWeight: 700, color: '#0f172a' },
                  children: 'Hacé Cuentas',
                },
              },
            ],
          },
        },
        // Middle: eyebrow + title
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '14px' },
            children: [
              eyebrow ? {
                type: 'span',
                props: {
                  style: {
                    fontSize: '22px', color: accent, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '2px',
                  },
                  children: eyebrow,
                },
              } : null,
              {
                type: 'h1',
                props: {
                  style: {
                    fontSize: title.length > 50 ? '56px' : '68px',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.12,
                    margin: 0,
                    letterSpacing: '-1.5px',
                  },
                  children: title,
                },
              },
            ].filter(Boolean),
          },
        },
        // Bottom: badges
        {
          type: 'div',
          props: {
            style: { display: 'flex', gap: '14px', fontSize: '20px' },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    padding: '10px 20px', borderRadius: '999px',
                    background: '#0f172a', color: '#fff', fontWeight: 600,
                  },
                  children: '✓ Gratis',
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    padding: '10px 20px', borderRadius: '999px',
                    background: '#fff', color: '#0f172a', fontWeight: 600,
                    border: `2px solid ${accent}`,
                  },
                  children: '⚡ Instantáneo',
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    padding: '10px 20px', borderRadius: '999px',
                    background: '#fff', color: '#0f172a', fontWeight: 600,
                    border: `2px solid ${accent}`,
                  },
                  children: '🔒 Sin registro',
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function renderToPng(title, eyebrow, accent) {
  const svg = await satori(template({ title, eyebrow, accent }), {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
      { name: 'Inter', data: interBold, weight: 800, style: 'normal' },
      { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
      { name: 'Inter', data: interRegular, weight: 600, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return png;
}

// Páginas a generar (curadas, no long tail)
const PAGES = [
  { slug: 'index', title: 'Calculadoras para Argentina y LatAm', eyebrow: 'Gratis · Sin registro', accent: '#2563eb' },
  { slug: 'guias', title: '10 Guías completas para entender tus finanzas', eyebrow: 'Guías pilares', accent: '#2563eb' },
  { slug: 'presupuesto-familiar', title: 'Presupuesto Familiar Maestro 50/30/20', eyebrow: 'Salud financiera', accent: '#059669' },
  { slug: 'simulador-jubilacion-anses', title: 'Simulador de Jubilación ANSES', eyebrow: 'ANSES 2026', accent: '#0891b2' },
  { slug: 'cambio-de-monedas', title: 'Cambio de Monedas — Dólar, Euro, Real', eyebrow: 'Actualizado en vivo', accent: '#ca8a04' },
  { slug: 'cotizacion-cripto', title: 'Cotización de Criptomonedas en tiempo real', eyebrow: 'Cripto', accent: '#ea580c' },
  { slug: 'inflacion-argentina', title: 'Inflación Argentina — IPC histórico', eyebrow: 'BCRA + INDEC', accent: '#dc2626' },
  { slug: 'comparador-plazo-fijo', title: 'Comparador de Plazos Fijos 2026', eyebrow: 'Tasas BCRA', accent: '#2563eb' },
  { slug: 'valores-bcra', title: 'Valores BCRA — Dólar, Leliq, Reservas', eyebrow: 'BCRA', accent: '#2563eb' },
  // 10 guías pilares
  { slug: 'guia-finanzas-personales', title: 'Finanzas Personales — Guía completa', eyebrow: 'Guía pilar', accent: '#2563eb' },
  { slug: 'guia-sueldos-argentina-2026', title: 'Sueldos Argentina 2026', eyebrow: 'Guía pilar', accent: '#2563eb' },
  { slug: 'guia-impuestos-argentina-2026', title: 'Impuestos Argentina 2026', eyebrow: 'Guía pilar', accent: '#059669' },
  { slug: 'guia-subsidios-anses-2026', title: 'Subsidios ANSES 2026', eyebrow: 'Guía pilar', accent: '#0891b2' },
  { slug: 'guia-salud-nutricion-fitness', title: 'Salud, Nutrición y Fitness', eyebrow: 'Guía pilar', accent: '#dc2626' },
  { slug: 'guia-embarazo-y-bebe', title: 'Embarazo y Bebé — Guía completa', eyebrow: 'Guía pilar', accent: '#ec4899' },
  { slug: 'guia-productividad-aprendizaje', title: 'Productividad y Aprendizaje', eyebrow: 'Guía pilar', accent: '#7c3aed' },
  { slug: 'guia-matematicas-ciencias', title: 'Matemáticas y Ciencias', eyebrow: 'Guía pilar', accent: '#2563eb' },
  { slug: 'guia-construccion-diy-hogar', title: 'Construcción, DIY y Hogar', eyebrow: 'Guía pilar', accent: '#ca8a04' },
  { slug: 'guia-cocina-medidas-recetas', title: 'Cocina, Medidas y Recetas', eyebrow: 'Guía pilar', accent: '#ea580c' },
];

// Categorías principales
const CATEGORY_META = {
  finanzas: { label: 'Finanzas', accent: '#2563eb' },
  salud: { label: 'Salud', accent: '#dc2626' },
  deportes: { label: 'Deportes', accent: '#16a34a' },
  vida: { label: 'Vida diaria', accent: '#0891b2' },
  educacion: { label: 'Educación', accent: '#7c3aed' },
  cocina: { label: 'Cocina', accent: '#ea580c' },
  construccion: { label: 'Construcción', accent: '#ca8a04' },
  tecnologia: { label: 'Tecnología', accent: '#2563eb' },
  matematica: { label: 'Matemática', accent: '#2563eb' },
  marketing: { label: 'Marketing', accent: '#ec4899' },
  negocios: { label: 'Negocios', accent: '#059669' },
  ciencia: { label: 'Ciencia', accent: '#2563eb' },
  mascotas: { label: 'Mascotas', accent: '#ea580c' },
  viajes: { label: 'Viajes', accent: '#0891b2' },
  familia: { label: 'Familia', accent: '#ec4899' },
  automotor: { label: 'Automotor', accent: '#64748b' },
  idiomas: { label: 'Idiomas', accent: '#7c3aed' },
  jardineria: { label: 'Jardinería', accent: '#16a34a' },
  entretenimiento: { label: 'Entretenimiento', accent: '#db2777' },
  electronica: { label: 'Electrónica', accent: '#2563eb' },
};

for (const [cat, meta] of Object.entries(CATEGORY_META)) {
  PAGES.push({
    slug: `categoria-${cat}`,
    title: `Calculadoras de ${meta.label}`,
    eyebrow: 'Categoría',
    accent: meta.accent,
  });
}

// Top 30 calcs estrella (mismas que sitemap-priority)
const TOP_CALCS = [
  'sueldo-en-mano-argentina',
  'calculadora-aguinaldo-sac',
  'calculadora-indemnizacion-despido',
  'calculadora-imc',
  'calculadora-cuota-prestamo',
  'calculadora-interes-compuesto',
  'calculadora-monotributo-2026',
  'calculadora-plazo-fijo',
  'calculadora-embarazo',
  'calculadora-calorias-diarias-tdee',
  'calculadora-ovulacion-dias-fertiles',
  'calculadora-regla-de-tres-simple',
  'calculadora-porcentajes',
  'calculadora-edad-exacta',
  'conversor-dolar-euro-pesos-argentinos',
  'calculadora-fecha-probable-parto',
  'calculadora-pintura-por-m2-litros-latas',
  'calculadora-ladrillos-por-m2-construccion',
  'calculadora-factorial-combinatoria-permutaciones',
  'calculadora-propina-dividir-cuenta',
  'calculadora-iva-incluido-neto-discriminar',
  'calculadora-fire-retiro-temprano',
  'calculadora-inflacion-acumulada-periodo',
  'calculadora-grasa-corporal-pliegues',
  'calculadora-ciclo-menstrual',
  'calculadora-retencion-ganancias-rg-830',
  'calculadora-impuesto-ganancias-sueldo',
];

// Leer los calcs reales para obtener h1 y category
const CALCS_DIR = join(ROOT, 'src', 'content', 'calcs');
const calcs = readdirSync(CALCS_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8')));

const calcMap = new Map(calcs.map((c) => [c.slug, c]));
for (const slug of TOP_CALCS) {
  const c = calcMap.get(slug);
  if (!c) { console.warn(`⚠️  ${slug}: no JSON`); continue; }
  const meta = CATEGORY_META[c.category] || { label: c.category, accent: '#2563eb' };
  PAGES.push({
    slug,
    title: c.h1,
    eyebrow: meta.label,
    accent: meta.accent,
  });
}

// Generar
console.log(`Generando ${PAGES.length} OG images...`);
let ok = 0, fail = 0;
for (const p of PAGES) {
  try {
    const png = await renderToPng(p.title, p.eyebrow, p.accent);
    writeFileSync(join(OUT_DIR, `${p.slug}.png`), png);
    ok++;
  } catch (e) {
    console.error(`❌ ${p.slug}: ${e.message}`);
    fail++;
  }
}
console.log(`✅ OG images: ${ok} ok, ${fail} fail`);
