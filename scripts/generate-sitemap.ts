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

import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CALCS_DIR = join(ROOT, 'src', 'content', 'calcs');
const CALCS_EN_DIR = join(ROOT, 'src', 'content', 'calcs-en');
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

function getLastMod(filepath: string, fallback: string): string {
  try {
    return statSync(filepath).mtime.toISOString().split('T')[0];
  } catch { return fallback; }
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

// 1. Core: home + institucionales + páginas top
sitemaps.push({
  name: 'sitemap-core.xml',
  urls: [
    { loc: `${site}/`, priority: '1.0', changefreq: 'daily', lastmod: buildDate },
    { loc: `${site}/buscar`, priority: '0.7', changefreq: 'monthly', lastmod: buildDate },
    { loc: `${site}/comparador-plazo-fijo`, priority: '0.85', changefreq: 'daily', lastmod: buildDate },
    { loc: `${site}/valores-bcra`, priority: '0.85', changefreq: 'daily', lastmod: buildDate },
    { loc: `${site}/embeber`, priority: '0.6', changefreq: 'monthly', lastmod: buildDate },
    { loc: `${site}/sobre-nosotros`, priority: '0.5', changefreq: 'yearly', lastmod: buildDate },
    { loc: `${site}/privacidad`, priority: '0.3', changefreq: 'yearly', lastmod: buildDate },
    { loc: `${site}/cookies`, priority: '0.3', changefreq: 'yearly', lastmod: buildDate },
    { loc: `${site}/terminos`, priority: '0.3', changefreq: 'yearly', lastmod: buildDate },
    { loc: `${site}/politica-editorial`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
    { loc: `${site}/metodologia`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
    { loc: `${site}/contacto`, priority: '0.4', changefreq: 'yearly', lastmod: buildDate },
    { loc: `${site}/glosario`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
    { loc: `${site}/blog`, priority: '0.7', changefreq: 'weekly', lastmod: buildDate },
  ],
});

// 2. Calcs por categoría (un sitemap por categoría)
const byCat: Record<string, any[]> = {};
for (const c of calcs as any[]) {
  const cat = c.category || 'otros';
  (byCat[cat] ||= []).push(c);
}

for (const [cat, items] of Object.entries(byCat).sort()) {
  const urls: Url[] = [
    // Categoría misma
    { loc: `${site}/categoria/${cat}`, priority: '0.8', changefreq: 'weekly', lastmod: buildDate },
    // Calcs de esa categoría
    ...items.map((c: any) => ({
      loc: `${site}/${c.slug}`,
      priority: topSlugs.has(c.slug) ? '0.9' : '0.7',
      changefreq: 'weekly',
      lastmod: getLastMod(join(CALCS_DIR, `${c.formulaId || c.slug}.json`), buildDate),
    })),
  ];
  sitemaps.push({ name: `sitemap-calcs-${cat}.xml`, urls });
}

// 3. Calcs inglés
if (calcsEn.length > 0) {
  sitemaps.push({
    name: 'sitemap-en.xml',
    urls: (calcsEn as any[]).map((c: any) => ({
      loc: `${site}/en/${c.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: buildDate,
    })),
  });
}

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

// 5. Comparaciones
if (comparaciones.length > 0) {
  sitemaps.push({
    name: 'sitemap-comparaciones.xml',
    urls: (comparaciones as any[]).map((c: any) => ({
      loc: `${site}/comparar/${c.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: buildDate,
    })),
  });
}

// 6. Tablas de referencia
if (tablas.length > 0) {
  sitemaps.push({
    name: 'sitemap-tablas.xml',
    urls: (tablas as any[]).map((t: any) => ({
      loc: `${site}/tabla/${t.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: buildDate,
    })),
  });
}

// 7. Glosario
if (glosarioTerms.length > 0) {
  sitemaps.push({
    name: 'sitemap-glosario.xml',
    urls: (glosarioTerms as any[]).map((t: any) => ({
      loc: `${site}/glosario/${t.slug}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: buildDate,
    })),
  });
}

// 8. Argentina provincial
const argUrls: Url[] = [];
for (const calc of argCalcs as any[]) {
  for (const p of provincias) {
    if (calc.provinceData && calc.provinceData[p.slug]) {
      argUrls.push({
        loc: `${site}/argentina/${p.slug}/${calc.calcSlug}`,
        priority: '0.6',
        changefreq: 'monthly',
        lastmod: buildDate,
      });
    }
  }
}
if (argUrls.length > 0) {
  sitemaps.push({ name: 'sitemap-argentina.xml', urls: argUrls });
}

// --------------------------------------------------------------------------
// Write files
// --------------------------------------------------------------------------

let totalUrls = 0;
for (const s of sitemaps) {
  writeFileSync(join(PUBLIC_DIR, s.name), urlsetXml(s.urls), 'utf8');
  totalUrls += s.urls.length;
}

// Index principal
const indexContent = indexXml(
  sitemaps.map((s) => ({ loc: `${site}/${s.name}`, lastmod: buildDate }))
);
writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), indexContent, 'utf8');

console.log(`✓ sitemap index → ${sitemaps.length} sitemaps, ${totalUrls} URLs totales`);
for (const s of sitemaps) {
  console.log(`  · ${s.name.padEnd(40)} ${String(s.urls.length).padStart(5)} URLs`);
}
