/**
 * Genera public/sitemap.xml como archivo estático antes del build de Astro.
 *
 * ¿Por qué no usar src/pages/sitemap.xml.ts (API route)?
 * Cloudflare Pages intenta correr los API routes con miniflare (Workers runtime)
 * que no soporta Node.js fs APIs → explota con "Illegal invocation".
 * Generarlo como archivo estático en public/ lo resuelve de raíz.
 *
 * Se actualiza solo en cada build — cada calc nueva aparece automáticamente.
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
const OUT_FILE = join(ROOT, 'public', 'sitemap.xml');

// Leer todos los JSONs de calcs
const calcs = readdirSync(CALCS_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8')));

// Leer todos los JSONs de blog
const blogPosts = readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(BLOG_DIR, f), 'utf8')));

// Leer todos los JSONs de calcs en inglés
const calcsEn = readdirSync(CALCS_EN_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(CALCS_EN_DIR, f), 'utf8')));

const site = 'https://hacecuentas.com';
const buildDate = new Date().toISOString().split('T')[0];

function getLastMod(slug: string): string {
  try {
    const calc = calcs.find((c: any) => c.slug === slug);
    if (!calc) return buildDate;
    const filename = `${calc.formulaId || slug}.json`;
    const stat = statSync(join(CALCS_DIR, filename));
    return stat.mtime.toISOString().split('T')[0];
  } catch {
    return buildDate;
  }
}

// Categorías únicas
const cats = [...new Set(calcs.map((c: any) => c.category))];

// Top-tier calcs con mayor prioridad
const topSlugs = [
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
];

const urls = [
  // Top-tier
  { loc: `${site}/`, priority: '1.0', changefreq: 'daily', lastmod: buildDate },
  { loc: `${site}/buscar`, priority: '0.7', changefreq: 'monthly', lastmod: buildDate },
  { loc: `${site}/comparador-plazo-fijo`, priority: '0.85', changefreq: 'daily', lastmod: buildDate },
  { loc: `${site}/valores-bcra`, priority: '0.85', changefreq: 'daily', lastmod: buildDate },

  // Categorías
  ...cats.map((cat) => ({
    loc: `${site}/categoria/${cat}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: buildDate,
  })),

  // Calculadoras
  ...calcs.map((c: any) => ({
    loc: `${site}/${c.slug}`,
    priority: topSlugs.includes(c.slug) ? '0.9' : '0.7',
    changefreq: 'weekly',
    lastmod: getLastMod(c.slug),
  })),

  // Calculadoras en inglés
  ...calcsEn.map((c: any) => ({
    loc: `${site}/en/${c.slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: buildDate,
  })),

  // Blog posts
  ...blogPosts.map((p: any) => ({
    loc: `${site}/blog/${p.slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: p.updatedDate || p.date || buildDate,
  })),

  // Legales y editoriales
  { loc: `${site}/sobre-nosotros`, priority: '0.4', changefreq: 'yearly', lastmod: buildDate },
  { loc: `${site}/privacidad`, priority: '0.3', changefreq: 'yearly', lastmod: buildDate },
  { loc: `${site}/cookies`, priority: '0.3', changefreq: 'yearly', lastmod: buildDate },
  { loc: `${site}/terminos`, priority: '0.3', changefreq: 'yearly', lastmod: buildDate },
  { loc: `${site}/politica-editorial`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
  { loc: `${site}/metodologia`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
  { loc: `${site}/contacto`, priority: '0.4', changefreq: 'yearly', lastmod: buildDate },
  { loc: `${site}/glosario`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
  { loc: `${site}/blog`, priority: '0.7', changefreq: 'weekly', lastmod: buildDate },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

writeFileSync(OUT_FILE, xml, 'utf8');
console.log(`✓ sitemap.xml → ${urls.length} URLs`);
