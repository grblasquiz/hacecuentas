/**
 * Genera sitemap segmentado como archivos estáticos antes del build de Astro.
 *
 * Arquitectura:
 *   /sitemap.xml                    → sitemap index (tabla de contenidos)
 *     → /sitemap-core.xml           → home, legales, páginas institucionales
 *     → /sitemap-calcs-{cat}.xml    → 1 sitemap por categoría (20 sitemaps)
 *     → /sitemap-en.xml             → calculadoras inglés
 *     → /sitemap-blog.xml           → posts del blog
 *     → /sitemap-comparaciones.xml
 *     → /sitemap-tablas.xml
 *     → /sitemap-glosario.xml
 *     → /sitemap-argentina.xml      → calcs por provincia
 *
 * Por qué segmentar:
 *   Un sitemap con 2200+ URLs se crawlea lento y Google prioriza los primeros N.
 *   Separar por sección hace que Google descubra más rápido las calcs nuevas y
 *   permite ver en Search Console qué sección tiene más/menos indexación.
 *
 * Usage: npm run sitemap (también corre en prebuild)
 */

import { readFileSync, writeFileSync, statSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CALCS_DIR = join(ROOT, 'src', 'content', 'calcs');
const CALCS_EN_DIR = join(ROOT, 'src', 'content', 'calcs-en');
const CALCS_PT_DIR = join(ROOT, 'src', 'content', 'calcs-pt');
const CALCS_MX_DIR = join(ROOT, 'src', 'content', 'calcs-mx');
const CALCS_ES_DIR = join(ROOT, 'src', 'content', 'calcs-es');
const CALCS_CO_DIR = join(ROOT, 'src', 'content', 'calcs-co');
const CALCS_CL_DIR = join(ROOT, 'src', 'content', 'calcs-cl');
const BLOG_DIR = join(ROOT, 'src', 'content', 'blog');
const TABLAS_DIR = join(ROOT, 'src', 'content', 'tablas');
const COMPARACIONES_DIR = join(ROOT, 'src', 'content', 'comparaciones');
const ARGENTINA_DIR = join(ROOT, 'src', 'content', 'argentina');
const GLOSARIO_DIR = join(ROOT, 'src', 'content', 'glosario');
const PUBLIC_DIR = join(ROOT, 'public');

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

interface Url {
  loc: string;
  priority: string;
  changefreq: string;
  lastmod: string;
}

function safeReadDir(dir: string): string[] {
  try { return readdirSync(dir); } catch { return []; }
}

function readJSONs(dir: string): any[] {
  return safeReadDir(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try { return JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch { return null; }
    })
    .filter(Boolean);
}

/**
 * Cache de timestamps git por archivo — evita N llamadas a git por cada build.
 * Se popula en build-time con `git log --format=%ct --name-only` (una sola llamada).
 */
let gitMtimeCache: Map<string, number> | null = null;

function loadGitMtimes(): Map<string, number> {
  if (gitMtimeCache) return gitMtimeCache;
  gitMtimeCache = new Map();
  try {
    // Formato: timestamp seguido de archivos tocados en ese commit.
    // Procesamos de más reciente a más viejo, y solo guardamos la PRIMERA vez
    // que vemos cada archivo → ese es su último commit.
    const out = execSync('git log --format="%ct" --name-only', {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 100 * 1024 * 1024,
    });
    let currentTs = 0;
    for (const line of out.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (/^\d+$/.test(trimmed)) {
        currentTs = parseInt(trimmed, 10);
      } else if (currentTs && !gitMtimeCache.has(trimmed)) {
        gitMtimeCache.set(trimmed, currentTs);
      }
    }
  } catch (err) {
    console.warn('[sitemap] git log falló, cae a mtime:', (err as Error).message);
  }
  return gitMtimeCache;
}

/**
 * Devuelve el timestamp del último commit que tocó el archivo, como YYYY-MM-DD.
 * Fallback a mtime del FS si git no está disponible (ej. fuera de un repo).
 *
 * En CI (GitHub Actions), el mtime de los archivos es el momento del checkout,
 * no el momento del último commit — por eso mtime solo no sirve. git log sí.
 */
function getLastMod(filepath: string, fallback: string): string {
  try {
    const rel = relative(ROOT, filepath).replace(/\\/g, '/');
    const ts = loadGitMtimes().get(rel);
    if (ts) {
      return new Date(ts * 1000).toISOString().split('T')[0];
    }
    // Fallback: mtime (útil para archivos recién creados todavía no commiteados
    // o en entornos sin git).
    return statSync(filepath).mtime.toISOString().split('T')[0];
  } catch { return fallback; }
}

/**
 * Devuelve el lastmod editorial de un calc, priorizando señales explícitas
 * sobre el mtime del filesystem.
 *
 * Política (de mayor a menor prioridad):
 *   1. calc.lastReviewed   — revisión editorial humana ("repasé esto, está OK")
 *   2. calc.dataUpdate.lastUpdated — refresh de data externa (escalas, alícuotas)
 *   3. mtime (git log) del JSON — fallback para calcs sin metadata editorial
 *   4. fallback (buildDate)
 *
 * Por qué editorial gana sobre mtime: scripts de mass-edit cosmético
 * (re-format, backfill de campos no-visibles, normalización de slugs) tocan
 * cientos de JSON en un commit sin que cambie el contenido user-facing. Si
 * mtime ganara siempre, el sitemap reportaría todas esas URLs como cambiadas
 * y Google empezaría a desconfiar del lastmod (señal envenenada).
 *
 * Implicaciones:
 *   - Si un calc tiene lastReviewed, ese campo ES la fuente de verdad. Para
 *     mover su lastmod, bumpear lastReviewed manualmente.
 *   - Calcs sin lastReviewed siguen con mtime — comportamiento previo intacto
 *     para el 90% del catálogo.
 *   - dataUpdate.lastUpdated solo aplica si NO hay lastReviewed (revisión
 *     editorial es señal más fuerte que refresh de data).
 */
function getCalcLastMod(calc: any, filepath: string, fallback: string): string {
  if (calc?.lastReviewed && /^\d{4}-\d{2}-\d{2}$/.test(calc.lastReviewed)) {
    return calc.lastReviewed;
  }
  if (calc?.dataUpdate?.lastUpdated && /^\d{4}-\d{2}-\d{2}$/.test(calc.dataUpdate.lastUpdated)) {
    return calc.dataUpdate.lastUpdated;
  }
  // Resolver el archivo real del calc. Convención histórica mixta en el repo:
  // ~1800 calcs se nombran por `formulaId`, ~600 por `slug`, ~14 por otra cosa.
  let resolved = filepath;
  if (!existsSync(resolved)) {
    const bySlug = join(CALCS_DIR, `${calc?.slug}.json`);
    if (existsSync(bySlug)) resolved = bySlug;
    else if (calc?.formulaId) {
      const byFormula = join(CALCS_DIR, `${calc.formulaId}.json`);
      if (existsSync(byFormula)) resolved = byFormula;
    }
  }
  if (existsSync(resolved)) {
    const mtime = getLastMod(resolved, '');
    if (mtime) return mtime;
  }
  return fallback;
}

/**
 * Para páginas estáticas (home, legales, guías) devuelve el mtime del archivo
 * .astro correspondiente. Si no existe, cae al fallback. Esto evita que TODAS
 * las páginas estables aparezcan cambiadas el día del build, que es una señal
 * negativa para Google (baja confianza en el sitemap).
 */
function getPageLastMod(pagePath: string, fallback: string): string {
  // pagePath ej: '/privacidad' → src/pages/privacidad.astro
  const pagesDir = join(ROOT, 'src', 'pages');
  const slug = pagePath.replace(/^\/|\/$/g, '') || 'index';
  const candidates = [
    join(pagesDir, `${slug}.astro`),
    join(pagesDir, slug, 'index.astro'),
  ];
  for (const c of candidates) {
    const d = getLastMod(c, '');
    if (d) return d;
  }
  return fallback;
}

/**
 * Devuelve el lastmod máximo (más reciente) de un set de URLs.
 * Se usa para el sitemap index y para índices de categoría/locale —
 * así el lastmod refleja "el cambio más reciente adentro", no la fecha del build.
 * Si Google ve que el index cambió pero el 99% de URLs adentro no, pierde confianza.
 */
function maxLastmod(urls: Url[], fallback: string): string {
  let best = '';
  for (const u of urls) {
    if (u.lastmod && u.lastmod > best) best = u.lastmod;
  }
  return best || fallback;
}

function urlsetXml(urls: Url[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

function indexXml(sitemaps: Array<{ loc: string; lastmod: string }>): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((s) => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
}

// --------------------------------------------------------------------------
// Data loading
// --------------------------------------------------------------------------

const calcs = readJSONs(CALCS_DIR);
const calcsEn = readJSONs(CALCS_EN_DIR);
const calcsPt = readJSONs(CALCS_PT_DIR);
const calcsMx = readJSONs(CALCS_MX_DIR);
const calcsEs = readJSONs(CALCS_ES_DIR);
const calcsCo = readJSONs(CALCS_CO_DIR);
const calcsCl = readJSONs(CALCS_CL_DIR);
const blogPosts = readJSONs(BLOG_DIR);
const tablas = readJSONs(TABLAS_DIR);
const comparaciones = readJSONs(COMPARACIONES_DIR);
const glosarioTerms = readJSONs(GLOSARIO_DIR);

let provincias: any[] = [];
try {
  provincias = JSON.parse(readFileSync(join(ARGENTINA_DIR, 'provincias.json'), 'utf8'));
} catch { provincias = []; }

const argCalcs = safeReadDir(ARGENTINA_DIR)
  .filter((f) => f.endsWith('.json') && f !== 'provincias.json')
  .map((f) => {
    try { return JSON.parse(readFileSync(join(ARGENTINA_DIR, f), 'utf8')); } catch { return null; }
  })
  .filter((c: any) => c && c.calcSlug);

const site = 'https://hacecuentas.com';
const buildDate = new Date().toISOString().split('T')[0];

const topSlugs = new Set([
  'sueldo-en-mano-argentina',
  'calculadora-aguinaldo-sac',
  'calculadora-indemnizacion-despido',
  'calculadora-imc',
  'calculadora-cuota-prestamo',
  'calculadora-interes-compuesto',
  'calculadora-monotributo-2026',
  'calculadora-plazo-fijo',
  'calculadora-retencion-ganancias-rg-830',
  'calculadora-impuesto-ganancias-sueldo',
  'calculadora-roas-retorno-inversion-publicitaria',
  'calculadora-descenso-futbol-argentino-promedios',
]);

// --------------------------------------------------------------------------
// Build individual sitemaps
// --------------------------------------------------------------------------

const sitemaps: Array<{ name: string; urls: Url[] }> = [];

// 0. Priority sitemap: las ~60 URLs top (home, guías, categorías, calcs estrella).
// Este se declara PRIMERO en el index para que Google lo lea/crawle antes que el resto.
// Crawl budget argument: cuando el sitemap inicial es chico y relevante, Google
// asigna crawl budget a esas URLs preferentemente.
// Mismo criterio que sitemap-core: dinámicas=buildDate, estables=mtime de pagina.
const prio = (path: string, priority: string, changefreq: string, dynamic = false): Url => ({
  loc: `${site}${path}`,
  priority,
  changefreq,
  lastmod: dynamic ? buildDate : getPageLastMod(path, buildDate),
});
const priorityUrls: Url[] = [
  prio('/',                                  '1.0',  'daily',  true),
  prio('/guias',                             '0.95', 'weekly'),
  prio('/cambio-de-monedas',                 '0.95', 'hourly', true),
  prio('/cotizacion-cripto',                 '0.95', 'hourly', true),
  prio('/inflacion-argentina',               '0.95', 'daily',  true),
  prio('/presupuesto-familiar',              '0.95', 'weekly'),
  prio('/simulador-jubilacion-anses',        '0.95', 'weekly'),
  prio('/comparador-plazo-fijo',             '0.9',  'daily',  true),
  prio('/valores-bcra',                      '0.9',  'daily',  true),
  // 10 guías pilares (estables)
  prio('/guia/finanzas-personales',          '0.9',  'weekly'),
  prio('/guia/sueldos-argentina-2026',       '0.9',  'weekly'),
  prio('/guia/impuestos-argentina-2026',     '0.9',  'weekly'),
  prio('/guia/subsidios-anses-2026',         '0.9',  'weekly'),
  prio('/guia/salud-nutricion-fitness',      '0.9',  'weekly'),
  prio('/guia/embarazo-y-bebe',              '0.9',  'weekly'),
  prio('/guia/construccion-diy-hogar',       '0.9',  'weekly'),
  prio('/guia/matematicas-ciencias',         '0.9',  'weekly'),
  prio('/guia/productividad-aprendizaje',    '0.9',  'weekly'),
  prio('/guia/cocina-medidas-recetas',       '0.9',  'weekly'),
];
// Top categorías (las más grandes) — estable salvo deploys del template de categoría
for (const cat of ['finanzas', 'vida', 'salud', 'educacion', 'mascotas', 'matematica', 'cocina', 'deportes', 'tecnologia', 'viajes', 'construccion', 'marketing', 'negocios', 'ciencia', 'automotor', 'familia', 'idiomas', 'jardineria', 'electronica', 'entretenimiento']) {
  priorityUrls.push(prio(`/categoria/${cat}`, '0.85', 'weekly'));
}
// Top calcs estrella verificadas (slugs reales — chequear con dist/ si agregás)
const topPrioritySlugs = [
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
  'calculadora-cemento-arena-hormigon-receta-metro-cubico',
  'calculadora-factorial-combinatoria-permutaciones',
  'calculadora-propina-dividir-cuenta',
  'calculadora-black-friday-descuento-real',
  'calculadora-iva-incluido-neto-discriminar',
  'calculadora-fire-retiro-temprano',
  'calculadora-inflacion-acumulada-periodo',
  'calculadora-grasa-corporal-pliegues',
  'calculadora-macros-distribucion-proteina-carbos-grasas',
  'calculadora-ciclo-menstrual',
  'calculadora-retencion-ganancias-rg-830',
  'calculadora-impuesto-ganancias-sueldo',
  'calculadora-descenso-futbol-argentino-promedios',
];
const calcBySlug = new Map((calcs as any[]).map((c: any) => [c.slug, c]));
for (const slug of topPrioritySlugs) {
  const c = calcBySlug.get(slug);
  if (!c) continue;
  const fp = join(CALCS_DIR, `${c.formulaId || c.slug}.json`);
  priorityUrls.push({
    loc: `${site}/${slug}`,
    priority: '0.9',
    changefreq: 'weekly',
    lastmod: getCalcLastMod(c, fp, buildDate),
  });
}

sitemaps.push({ name: 'sitemap-priority.xml', urls: priorityUrls });

// 1. Core: home + institucionales + páginas top
// lastmod: páginas genuinamente dinámicas (home, dólar, bcra, cripto, inflación,
// plazo-fijo) usan buildDate porque sus datos cambian a diario. Las estables
// (legales, guías, páginas "about") usan mtime del .astro — así no parecen
// haber cambiado todo el día y Google no pierde confianza en el sitemap.
const core = (path: string, priority: string, changefreq: string, dynamic = false): Url => ({
  loc: `${site}${path}`,
  priority,
  changefreq,
  lastmod: dynamic ? buildDate : getPageLastMod(path, buildDate),
});
sitemaps.push({
  name: 'sitemap-core.xml',
  urls: [
    core('/',                                    '1.0',  'daily',   true),
    core('/comparador-plazo-fijo',               '0.85', 'daily',   true),
    core('/valores-bcra',                        '0.85', 'daily',   true),
    core('/cambio-de-monedas',                   '0.95', 'hourly',  true),
    core('/cotizacion-cripto',                   '0.95', 'hourly',  true),
    core('/inflacion-argentina',                 '0.9',  'daily',   true),
    core('/presupuesto-familiar',                '0.95', 'weekly'),
    core('/simulador-jubilacion-anses',          '0.95', 'weekly'),
    core('/tracker-embarazo-semana-a-semana',    '0.95', 'weekly'),
    core('/cuanto-falta-para-Navidad-2026',      '0.9',  'daily',   true),
    core('/guias',                               '0.9',  'weekly'),
    core('/guia/sueldos-argentina-2026',         '0.85', 'weekly'),
    core('/guia/impuestos-argentina-2026',       '0.85', 'weekly'),
    core('/guia/subsidios-anses-2026',           '0.85', 'weekly'),
    core('/guia/finanzas-personales',            '0.85', 'weekly'),
    core('/guia/salud-nutricion-fitness',        '0.85', 'weekly'),
    core('/guia/embarazo-y-bebe',                '0.85', 'weekly'),
    core('/guia/construccion-diy-hogar',         '0.85', 'weekly'),
    core('/guia/matematicas-ciencias',           '0.85', 'weekly'),
    core('/guia/productividad-aprendizaje',      '0.85', 'weekly'),
    core('/guia/cocina-medidas-recetas',         '0.85', 'weekly'),
    core('/global',                              '0.9',  'weekly',  true),
    core('/es',                                  '0.85', 'weekly',  true),
    core('/mx',                                  '0.85', 'weekly',  true),
    core('/co',                                  '0.8',  'weekly'),
    core('/cl',                                  '0.8',  'weekly'),
    core('/embeber',                             '0.6',  'monthly'),
    core('/sobre-nosotros',                      '0.5',  'yearly'),
    core('/privacidad',                          '0.3',  'yearly'),
    core('/cookies',                             '0.3',  'yearly'),
    core('/terminos',                            '0.3',  'yearly'),
    core('/aviso-legal',                         '0.5',  'yearly'),
    core('/politica-editorial',                  '0.5',  'monthly'),
    core('/metodologia',                         '0.5',  'monthly'),
    core('/contacto',                            '0.4',  'yearly'),
    core('/sugerir',                             '0.6',  'weekly'),
    core('/sugerencias',                         '0.7',  'daily',   true),
    core('/glosario',                            '0.5',  'monthly'),
    core('/blog',                                '0.7',  'weekly'),
  ],
});

// 2. Calcs por categoría (un sitemap por categoría)
const byCat: Record<string, any[]> = {};
for (const c of calcs as any[]) {
  const cat = c.category || 'otros';
  (byCat[cat] ||= []).push(c);
}

// Keywords de calcs con data frecuentemente actualizada (daily changefreq + prio 0.95)
const DAILY_KEYWORDS = ['dolar', 'plazo-fijo', 'inflacion', 'uva', 'cripto', 'bitcoin', 'euro', 'bcra'];
// Calcs nuevas/recientes (creadas en últimos 60 días) se marcan con priority alta + weekly
const NEW_DAYS = 60;

function getPriorityAndFreq(slug: string, filePath: string, buildDate: string): { priority: string; changefreq: string } {
  if (topSlugs.has(slug)) return { priority: '0.9', changefreq: 'weekly' };
  if (DAILY_KEYWORDS.some(k => slug.includes(k))) return { priority: '0.95', changefreq: 'daily' };

  // Calcs recientes = prioridad 0.8
  try {
    const { statSync } = require('node:fs');
    const mtime = statSync(filePath).mtime;
    const daysOld = (Date.now() - mtime.getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld < NEW_DAYS) return { priority: '0.8', changefreq: 'weekly' };
  } catch {}
  return { priority: '0.7', changefreq: 'monthly' };
}

for (const [cat, items] of Object.entries(byCat).sort()) {
  // Calcs primero para poder derivar el lastmod de la categoría a partir de ellas
  const calcUrls: Url[] = items.map((c: any) => {
    const filePath = join(CALCS_DIR, `${c.formulaId || c.slug}.json`);
    const pf = getPriorityAndFreq(c.slug, filePath, buildDate);
    return {
      loc: `${site}/${c.slug}`,
      priority: pf.priority,
      changefreq: pf.changefreq,
      lastmod: getCalcLastMod(c, filePath, buildDate),
    };
  });
  // La página de categoría hereda el lastmod de su calc más reciente — así
  // "agregaste una calc de finanzas hoy" mueve /categoria/finanzas, pero
  // "no tocaste finanzas en 3 meses" deja el lastmod quieto.
  const catUrl: Url = {
    loc: `${site}/categoria/${cat}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: maxLastmod(calcUrls, buildDate),
  };
  sitemaps.push({ name: `sitemap-calcs-${cat}.xml`, urls: [catUrl, ...calcUrls] });
}

// 3. Calcs por locale (EN, PT, MX, ES, CO, CL).
// lastmod usa mtime del archivo JSON correspondiente para no reportar buildDate
// uniforme. Cada locale tiene su directorio src/content/calcs-<locale>/.
function sitemapForLocale(cs: any[], locale: string, dir: string, withIndex: boolean): { name: string; urls: Url[] } {
  const calcUrls: Url[] = cs.map((c) => {
    const fp = join(dir, `${c.formulaId || c.slug}.json`);
    return {
      loc: `${site}/${locale}/${c.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: getCalcLastMod(c, fp, buildDate),
    };
  });
  // Home del locale hereda el lastmod del cambio más reciente del locale.
  const urls: Url[] = withIndex
    ? [
        {
          loc: `${site}/${locale}/`,
          priority: '0.8',
          changefreq: 'weekly',
          lastmod: maxLastmod(calcUrls, buildDate),
        },
        ...calcUrls,
      ]
    : calcUrls;
  return { name: `sitemap-${locale}.xml`, urls };
}

if (calcsEn.length > 0) sitemaps.push(sitemapForLocale(calcsEn, 'en', CALCS_EN_DIR, false));
if (calcsPt.length > 0) sitemaps.push(sitemapForLocale(calcsPt, 'pt', CALCS_PT_DIR, true));
if (calcsMx.length > 0) sitemaps.push(sitemapForLocale(calcsMx, 'mx', CALCS_MX_DIR, true));
if (calcsEs.length > 0) sitemaps.push(sitemapForLocale(calcsEs, 'es', CALCS_ES_DIR, true));
if (calcsCo.length > 0) sitemaps.push(sitemapForLocale(calcsCo, 'co', CALCS_CO_DIR, true));
if (calcsCl.length > 0) sitemaps.push(sitemapForLocale(calcsCl, 'cl', CALCS_CL_DIR, true));

// 4. Blog
if (blogPosts.length > 0) {
  sitemaps.push({
    name: 'sitemap-blog.xml',
    urls: (blogPosts as any[]).map((p: any) => ({
      loc: `${site}/blog/${p.slug}`,
      priority: '0.75',
      changefreq: 'monthly',
      lastmod: p.updatedDate || p.date || buildDate,
    })),
  });
}

// 5. Comparaciones, tablas, glosario — mtime del JSON (no del build)
function sitemapForContent(items: any[], dir: string, pathPrefix: string, priority: string): Url[] {
  return items.map((it: any) => {
    const fp = join(dir, `${it.slug}.json`);
    return {
      loc: `${site}/${pathPrefix}/${it.slug}`,
      priority,
      changefreq: 'monthly',
      lastmod: getLastMod(fp, buildDate),
    };
  });
}

if (comparaciones.length > 0) {
  sitemaps.push({ name: 'sitemap-comparaciones.xml', urls: sitemapForContent(comparaciones, COMPARACIONES_DIR, 'comparar', '0.7') });
}
if (tablas.length > 0) {
  sitemaps.push({ name: 'sitemap-tablas.xml', urls: sitemapForContent(tablas, TABLAS_DIR, 'tabla', '0.7') });
}
if (glosarioTerms.length > 0) {
  sitemaps.push({ name: 'sitemap-glosario.xml', urls: sitemapForContent(glosarioTerms, GLOSARIO_DIR, 'glosario', '0.6') });
}

// 8. Argentina provincial — lastmod del JSON de la calc
const argUrls: Url[] = [];
for (const calc of argCalcs as any[]) {
  // Buscar el archivo JSON en argentina/ que corresponda
  const argFile = safeReadDir(ARGENTINA_DIR).find(f => {
    if (f === 'provincias.json') return false;
    try {
      const c = JSON.parse(readFileSync(join(ARGENTINA_DIR, f), 'utf8'));
      return c.calcSlug === calc.calcSlug;
    } catch { return false; }
  });
  const fp = argFile ? join(ARGENTINA_DIR, argFile) : '';
  const mtime = getLastMod(fp, buildDate);
  for (const p of provincias) {
    if (calc.provinceData && calc.provinceData[p.slug]) {
      argUrls.push({
        loc: `${site}/argentina/${p.slug}/${calc.calcSlug}`,
        priority: '0.6',
        changefreq: 'monthly',
        lastmod: mtime,
      });
    }
  }
}
if (argUrls.length > 0) {
  sitemaps.push({ name: 'sitemap-argentina.xml', urls: argUrls });
}

// --------------------------------------------------------------------------
// IIBB programmatic — /iibb/index, /iibb/[provincia], /iibb/[prov]/[actividad]
// 1 + 24 + 240 = 265 páginas. Long-tail comercial alta intent.
// --------------------------------------------------------------------------
const iibbUrls: Url[] = [];
const iibbActFile = join(ROOT, 'src', 'content', 'iibb', 'actividades.json');
let iibbActividades: any[] = [];
try {
  iibbActividades = JSON.parse(readFileSync(iibbActFile, 'utf8'));
} catch {}

if (iibbActividades.length > 0 && provincias.length > 0) {
  // index
  iibbUrls.push({
    loc: `${site}/iibb`,
    priority: '0.85',
    changefreq: 'monthly',
    lastmod: buildDate,
  });
  // hub por provincia
  for (const p of provincias) {
    iibbUrls.push({
      loc: `${site}/iibb/${p.slug}`,
      priority: '0.75',
      changefreq: 'monthly',
      lastmod: buildDate,
    });
    // detalle por actividad
    for (const act of iibbActividades) {
      iibbUrls.push({
        loc: `${site}/iibb/${p.slug}/${act.slug}`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod: buildDate,
      });
    }
  }
  sitemaps.push({ name: 'sitemap-iibb.xml', urls: iibbUrls });
}

// --------------------------------------------------------------------------
// Image sitemap — listamos cada calc con su OG png como <image:image>.
// Apunta a Google Images para queries visuales y abre crawl path adicional.
// Solo incluye calcs que tienen un OG generado en public/og/{slug}.png.
// --------------------------------------------------------------------------

interface ImageEntry { loc: string; image: string; caption: string; }

function imagesetXml(entries: ImageEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map((e) => `  <url>
    <loc>${e.loc}</loc>
    <image:image>
      <image:loc>${e.image}</image:loc>
      <image:caption>${e.caption.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:caption>
    </image:image>
  </url>`).join('\n')}
</urlset>`;
}

const imageEntries: ImageEntry[] = [];
for (const c of calcs) {
  const ogPath = join(PUBLIC_DIR, 'og', `${c.slug}.png`);
  if (!existsSync(ogPath)) continue;
  imageEntries.push({
    loc: `${site}/${c.slug}`,
    image: `${site}/og/${c.slug}.png`,
    caption: (c.h1 || c.title || c.slug).slice(0, 200),
  });
}
if (imageEntries.length > 0) {
  writeFileSync(join(PUBLIC_DIR, 'sitemap-images.xml'), imagesetXml(imageEntries), 'utf8');
  // El sitemap de imágenes va al index con lastmod = buildDate (representa el set actual de OG).
  // Como urlset propio no calza con el typing Url[], lo agregamos al sitemaps[] para el index
  // pero usamos un dummy URL para que maxLastmod no rompa.
  sitemaps.push({
    name: 'sitemap-images.xml',
    urls: [{ loc: `${site}/`, lastmod: buildDate, changefreq: 'weekly', priority: '0.5' }],
    // marcamos que no se debe re-escribir desde urlsetXml (ya escribimos arriba con imagesetXml)
    // @ts-expect-error campo extra controlado abajo
    skipWrite: true,
  });
}

// --------------------------------------------------------------------------
// Write files
// --------------------------------------------------------------------------

let totalUrls = 0;
for (const s of sitemaps) {
  // sitemap-images.xml lo escribimos arriba con imagesetXml (schema distinto).
  if ((s as any).skipWrite) continue;
  writeFileSync(join(PUBLIC_DIR, s.name), urlsetXml(s.urls), 'utf8');
  totalUrls += s.urls.length;
}
totalUrls += imageEntries.length;

// Index principal. El lastmod de cada entry del index es el máximo de las URLs
// adentro de ese sitemap — si "sitemap-calcs-finanzas" no cambió, Google no
// va a re-crawlear ese sitemap. Antes esto era `buildDate` constante, lo que
// hacía que Google re-fetcheara todos los sub-sitemaps en cada deploy aunque
// el contenido fuera idéntico.
const indexContent = indexXml(
  sitemaps.map((s) => ({ loc: `${site}/${s.name}`, lastmod: maxLastmod(s.urls, buildDate) }))
);
writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), indexContent, 'utf8');

console.log(`✓ sitemap index → ${sitemaps.length} sitemaps, ${totalUrls} URLs totales`);
for (const s of sitemaps) {
  console.log(`  · ${s.name.padEnd(40)} ${String(s.urls.length).padStart(5)} URLs`);
}
