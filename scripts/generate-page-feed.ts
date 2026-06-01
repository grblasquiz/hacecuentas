/**
 * Genera el "page feed" de Google Ads (Dynamic Search Ads / Búsqueda Dinámica)
 * como CSV estático: public/google-page-feed.csv
 *
 * Qué es:
 *   Un CSV público con TODAS las URLs indexables del sitio + una etiqueta
 *   (Custom label) por sección/mercado, en el formato exacto que Google Ads
 *   espera para un page feed de DSA. Google Ads lo descarga desde la URL pública
 *   (Datos comerciales → Feeds de páginas → fetch programado) o se sube a mano.
 *
 * Fuente de URLs:
 *   Parsea los sitemaps ya generados en public/ (sitemap-*.xml). Así el feed es
 *   SIEMPRE exactamente el universo de URLs indexables, heredando gratis las
 *   mismas exclusiones que el sitemap (noindex, pruning-redirects, gone-410).
 *   ⚠️ DEBE correr DESPUÉS de generate-sitemap (prebuild fase 3).
 *
 * noindex:
 *   El CSV se sirve con `X-Robots-Tag: noindex` (ver public/_headers) y no se
 *   referencia en ningún sitemap ni link interno → Google no lo indexa. El feed
 *   sigue siendo fetchable por Google Ads (no se bloquea en robots.txt).
 *
 * Custom label:
 *   Se deriva del PATH de la URL (no del nombre del sitemap) → determinista y
 *   sin sesgo por el solapamiento entre sitemaps de categoría. Sirve para
 *   targetear subconjuntos en la campaña DSA (un mercado, el blog, etc.).
 *
 * Usage: npm run page-feed (corre en prebuild fase 3, tras el sitemap)
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC_DIR = join(ROOT, 'public');
const OUT_FILE = join(PUBLIC_DIR, 'google-page-feed.csv');

// sitemap.xml (el index) ya queda fuera: el filtro pide prefijo `sitemap-`.
// Estos otros sí empiezan con `sitemap-` pero no aportan páginas únicas:
//   sitemap-priority.xml → subconjunto curado (dupes)
//   sitemap-images.xml   → mismas páginas que calcs (dupes) + archivo grande
//   sitemap-news.xml     → subconjunto fresco (dupes), efímero
const SKIP = new Set([
  'sitemap-priority.xml',
  'sitemap-images.xml',
  'sitemap-news.xml',
]);

// Primer segmento del path que identifica una sección/mercado con prefijo propio.
const SECTION_PREFIXES = new Set([
  'en', 'pt', 'mx', 'es', 'co', 'cl', 'global', // locales / mercados
  'blog', 'tabla', 'comparar', 'glosario',       // contenido editorial
  'argentina', 'iibb', 'categoria', 'guia', 'top', // hubs y programáticas
]);

/**
 * Custom label = sección/mercado, derivada del path:
 *   /en/slug → en · /co → co · /blog/x → blog · /iibb/x/y → iibb
 *   /slug y / (home, institucionales, calcs AR raíz) → ar
 */
function labelFromUrl(url: string): string {
  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return 'ar';
  }
  const segs = pathname.split('/').filter(Boolean);
  if (segs.length === 0) return 'ar'; // home
  if (SECTION_PREFIXES.has(segs[0])) return segs[0];
  return 'ar'; // calcs AR (slug plano) + páginas institucionales
}

// Solo <loc> de <url> (urlset). El regex no matchea <image:loc> (otro tag).
const LOC_RX = /<loc>([^<]+)<\/loc>/g;

const urls = new Set<string>();
const files = readdirSync(PUBLIC_DIR).filter(
  (f) => f.startsWith('sitemap-') && f.endsWith('.xml') && !SKIP.has(f),
);

for (const file of files) {
  let xml: string;
  try {
    xml = readFileSync(join(PUBLIC_DIR, file), 'utf8');
  } catch {
    continue;
  }
  let m: RegExpExecArray | null;
  while ((m = LOC_RX.exec(xml)) !== null) {
    const url = m[1].trim();
    if (url) urls.add(url);
  }
}

// CSV con el header EXACTO que pide Google Ads para un page feed de DSA.
// Orden estable (alfabético por URL) → diffs limpios entre builds.
const rows = [...urls].sort((a, b) => a.localeCompare(b));
const csv =
  'Page URL,Custom label\n' +
  rows.map((url) => `${url},${labelFromUrl(url)}`).join('\n') +
  '\n';

writeFileSync(OUT_FILE, csv, 'utf8');

console.log(`✓ google-page-feed.csv → ${rows.length} URLs (page feed Google Ads DSA, noindex)`);
