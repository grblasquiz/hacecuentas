/**
 * Guard de links/slugs hardcodeados en superficies de navegación.
 *
 * Los slugs a mano en Header/Footer/home/pillars se filtran con `.filter(Boolean)`
 * en runtime (no rompen el build) pero desaparecen EN SILENCIO cuando el calc/sala
 * se borra o renombra — la clase de bug de los "componentCalcs con slugs muertos"
 * y los 60 links rotos de las salas. Este guard corre en prebuild y:
 *
 *   ERROR (falla el build):
 *     - href/slug hardcodeado que no resuelve a NINGUNA ruta viva
 *     - href que apunta a una URL con 410 Gone
 *   WARN (no falla):
 *     - href que apunta al ORIGEN de un redirect (funciona, pero regala un 301:
 *       actualizar el link al destino)
 *     - calcs root con `noindex: true` (chequeo anti-typo: deindexación accidental)
 *     - titles > 70 chars (truncado en SERP), solo conteo
 *
 * Superficies escaneadas: Header.astro, Footer.astro, index.astro (hrefs +
 * FEATURED_SALA_SLUGS + topPerCategory), pillars.ts (hrefs + mainCalc + calcs +
 * rooms + guide + categories).
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const errors: string[] = [];
const warns: string[] = [];

// ---- Universo de rutas vivas ------------------------------------------------

function jsonSlugs(dir: string): Set<string> {
  const out = new Set<string>();
  const full = join(ROOT, dir);
  if (!existsSync(full)) return out;
  for (const f of readdirSync(full)) {
    if (!f.endsWith('.json')) continue;
    try {
      const c = JSON.parse(readFileSync(join(full, f), 'utf8'));
      if (c.slug) out.add(c.slug);
      else out.add(f.replace(/\.json$/, ''));
    } catch {
      // JSON malformado: lo reporta validate-data-updates, acá skip
    }
  }
  return out;
}

const LOCALES = ['en', 'pt', 'co', 'mx', 'cl', 'pe', 'ec', 'es', 've', 'py', 'uy', 'do', 'pt-pt'];
const calcsByLocale = new Map<string, Set<string>>();
calcsByLocale.set('', jsonSlugs('src/content/calcs'));
for (const loc of LOCALES) calcsByLocale.set(loc, jsonSlugs(`src/content/calcs-${loc}`));

// Categorías vivas = union de category en calcs root
const categories = new Set<string>();
for (const f of readdirSync(join(ROOT, 'src/content/calcs'))) {
  if (!f.endsWith('.json')) continue;
  try {
    const c = JSON.parse(readFileSync(join(ROOT, 'src/content/calcs', f), 'utf8'));
    if (c.category) categories.add(c.category);
  } catch { /* skip */ }
}

// Salas de decisión: slug = filename en src/lib/decisions (+ subdirs país)
const NON_ROOM_FILES = new Set(['index', 'types', 'locales-registry', 'calc-backlinks']);
function roomSlugs(dir: string): Set<string> {
  const out = new Set<string>();
  const full = join(ROOT, dir);
  if (!existsSync(full)) return out;
  for (const f of readdirSync(full)) {
    if (!f.endsWith('.ts')) continue;
    const name = f.replace(/\.ts$/, '');
    if (!NON_ROOM_FILES.has(name)) out.add(name);
  }
  return out;
}
const roomsRoot = roomSlugs('src/lib/decisions');
const roomsByCountry = new Map<string, Set<string>>();
for (const cc of ['mx', 'cl', 'co', 'pe']) {
  roomsByCountry.set(cc, roomSlugs(`src/lib/decisions/${cc}`));
}

// Colecciones de contenido con ruta propia
const blogSlugs = jsonSlugs('src/content/blog');
const blogPtSlugs = jsonSlugs('src/content/blog-pt');
const guiaSlugs = jsonSlugs('src/content/guias');
const glosarioSlugs = jsonSlugs('src/content/glosario');
const compararSlugs = jsonSlugs('src/content/comparaciones');
const tablaSlugs = jsonSlugs('src/content/tablas');

// Páginas estáticas: walk src/pages → rutas (skip dinámicas y endpoints raros)
const staticRoutes = new Set<string>(['/']);
function walkPages(dir: string, prefix: string): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkPages(full, `${prefix}/${entry}`);
      continue;
    }
    if (entry.includes('[')) continue; // rutas dinámicas: validadas por colección
    if (entry.endsWith('.astro')) {
      const name = entry.replace(/\.astro$/, '');
      staticRoutes.add(name === 'index' ? (prefix || '/') : `${prefix}/${name}`);
    } else if (entry.endsWith('.ts')) {
      // endpoints tipo feed.json.ts / sitemap-fresh.xml.ts
      staticRoutes.add(`${prefix}/${entry.replace(/\.ts$/, '')}`);
    }
  }
}
walkPages(join(ROOT, 'src/pages'), '');

// Redirects (ambas capas) y 410
function parseRedirectSources(): Map<string, string> {
  const map = new Map<string, string>();
  const txt = readFileSync(join(ROOT, 'public/_redirects'), 'utf8');
  for (const raw of txt.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || !line.startsWith('/')) continue;
    const [src, dst] = line.split(/\s+/);
    if (src && dst && !src.includes('*') && !src.includes(':')) map.set(src, dst);
  }
  const pruning = readFileSync(join(ROOT, 'src/lib/pruning-redirects.ts'), 'utf8');
  const re = /'(\/[^']+)':\s*'(\/[^']*)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(pruning)) !== null) map.set(m[1], m[2]);
  return map;
}
const redirectSources = parseRedirectSources();
const goneUrls = new Set<string>();
{
  const goneTs = readFileSync(join(ROOT, 'src/lib/gone-410.ts'), 'utf8');
  const re = /"(\/[^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(goneTs)) !== null) goneUrls.add(m[1]);
}

// ---- Resolución de una ruta interna -----------------------------------------

// Prefijos dinámicos que no enumeramos (data anidada / superficies chicas)
const SKIP_PREFIXES = ['/api/', '/og/', '/img/', '/informes/', '/iibb/', '/argentina/', '/mi/', '/historias/', '/datasets/'];

function resolves(path: string): boolean {
  if (staticRoutes.has(path)) return true;
  // Archivos servidos desde public/ (sitemap.xml, rss.xml, ads.txt, etc.) —
  // los sitemaps se generan en prebuild así que pueden no existir aún: whitelist.
  if (/^\/(sitemap[\w-]*\.xml|rss\.xml|feed\.json|ads\.txt|robots\.txt|llms[\w.-]*\.txt|manifest\.webmanifest)$/.test(path)) return true;
  if (!path.slice(1).includes('/') && existsSync(join(ROOT, 'public', path.slice(1)))) return true;
  const seg = path.split('/').filter(Boolean);
  if (seg.length === 0) return true;
  // /categoria/<cat>(/top)?
  if (seg[0] === 'categoria' && seg[1]) {
    return categories.has(seg[1]) && (seg.length === 2 || (seg.length === 3 && seg[2] === 'top'));
  }
  // /decidir/<sala> | /<cc>/decidir/<sala>
  if (seg[0] === 'decidir' && seg.length === 2) return roomsRoot.has(seg[1]);
  if (seg.length === 3 && seg[1] === 'decidir') return roomsByCountry.get(seg[0])?.has(seg[2]) ?? false;
  // Colecciones
  if (seg[0] === 'blog' && seg.length === 2) return blogSlugs.has(seg[1]);
  if (seg[0] === 'pt' && seg[1] === 'blog' && seg.length === 3) return blogPtSlugs.has(seg[2]);
  if (seg[0] === 'guia' && seg.length === 2) return guiaSlugs.has(seg[1]);
  if (seg[0] === 'glosario' && seg.length === 2) return glosarioSlugs.has(seg[1]);
  if (seg[0] === 'comparar' && seg.length === 2) return compararSlugs.has(seg[1]);
  if (seg[0] === 'tabla' && seg.length === 2) return tablaSlugs.has(seg[1]);
  // /embed/<slug> espeja calcs root
  if (seg[0] === 'embed' && seg.length === 2) return calcsByLocale.get('')!.has(seg[1]);
  // Calc por locale: /<loc>/<slug> — o calc root /<slug>
  if (seg.length === 2 && calcsByLocale.has(seg[0])) return calcsByLocale.get(seg[0])!.has(seg[1]);
  if (seg.length === 1) return calcsByLocale.get('')!.has(seg[0]);
  return false;
}

function checkPath(path: string, source: string): void {
  // normalizar: sin query/fragment/trailing slash
  let p = path.split('#')[0].split('?')[0];
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  if (!p.startsWith('/') || p.startsWith('//')) return; // externo/protocol-relative
  if (SKIP_PREFIXES.some((pre) => p.startsWith(pre))) return;
  if (goneUrls.has(p)) {
    errors.push(`${source}: "${p}" tiene 410 Gone — remover el link`);
    return;
  }
  if (redirectSources.has(p)) {
    warns.push(`${source}: "${p}" es origen de redirect → actualizar a "${redirectSources.get(p)}"`);
    return;
  }
  if (!resolves(p)) {
    errors.push(`${source}: "${p}" no resuelve a ninguna ruta viva`);
  }
}

// ---- Extracción por superficie -----------------------------------------------

function extractHrefs(file: string): void {
  const src = readFileSync(join(ROOT, file), 'utf8');
  const re = /href(?::\s*|=)['"]([^'"$]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) checkPath(m[1], file);
}

function extractQuotedList(block: string): string[] {
  const out: string[] = [];
  const re = /['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) out.push(m[1]);
  return out;
}

for (const f of ['src/components/Header.astro', 'src/components/Footer.astro', 'src/pages/index.astro', 'src/lib/pillars.ts']) {
  extractHrefs(f);
}

// index.astro: FEATURED_SALA_SLUGS + topPerCategory
{
  const src = readFileSync(join(ROOT, 'src/pages/index.astro'), 'utf8');
  const featured = src.match(/FEATURED_SALA_SLUGS\s*=\s*\[([^\]]+)\]/);
  if (featured) {
    for (const s of extractQuotedList(featured[1])) {
      if (!roomsRoot.has(s)) errors.push(`index.astro FEATURED_SALA_SLUGS: sala "${s}" no existe`);
    }
  }
  const top = src.match(/topPerCategory[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (top) {
    const entryRe = /['"]?([\w-]+)['"]?:\s*\[([^\]]*)\]/g;
    let m: RegExpExecArray | null;
    while ((m = entryRe.exec(top[1])) !== null) {
      if (!categories.has(m[1])) warns.push(`index.astro topPerCategory: categoría "${m[1]}" sin calcs`);
      for (const s of extractQuotedList(m[2])) {
        if (!calcsByLocale.get('')!.has(s)) errors.push(`index.astro topPerCategory[${m[1]}]: calc "${s}" no existe`);
      }
    }
  }
}

// pillars.ts: mainCalc / calcs / rooms / guide / categories
{
  const src = readFileSync(join(ROOT, 'src/lib/pillars.ts'), 'utf8');
  const rootCalcs = calcsByLocale.get('')!;
  const listChecks: Array<{ key: string; valid: (s: string) => boolean; what: string }> = [
    { key: 'calcs', valid: (s) => rootCalcs.has(s), what: 'calc' },
    { key: 'rooms', valid: (s) => roomsRoot.has(s), what: 'sala' },
    { key: 'categories', valid: (s) => categories.has(s), what: 'categoría' },
  ];
  for (const { key, valid, what } of listChecks) {
    const re = new RegExp(`${key}:\\s*\\[([^\\]]+)\\]`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      for (const s of extractQuotedList(m[1])) {
        if (!valid(s)) errors.push(`pillars.ts ${key}: ${what} "${s}" no existe`);
        else if (redirectSources.has(`/${s}`)) warns.push(`pillars.ts ${key}: "${s}" es origen de redirect`);
      }
    }
  }
  const singleChecks: Array<{ key: string; valid: (s: string) => boolean; what: string }> = [
    { key: 'mainCalc', valid: (s) => rootCalcs.has(s), what: 'calc' },
    { key: 'guide', valid: (s) => guiaSlugs.has(s), what: 'guía' },
  ];
  for (const { key, valid, what } of singleChecks) {
    const re = new RegExp(`${key}:\\s*'([^']+)'`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      if (!valid(m[1])) errors.push(`pillars.ts ${key}: ${what} "${m[1]}" no existe`);
    }
  }
}

// ---- Audits de JSONs root (anti-typo, no fallan) ------------------------------
{
  const noindexed: string[] = [];
  let longTitles = 0;
  for (const f of readdirSync(join(ROOT, 'src/content/calcs'))) {
    if (!f.endsWith('.json')) continue;
    try {
      const c = JSON.parse(readFileSync(join(ROOT, 'src/content/calcs', f), 'utf8'));
      if (c.noindex === true) noindexed.push(c.slug || f);
      if (typeof c.title === 'string' && c.title.length > 70) longTitles++;
    } catch { /* skip */ }
  }
  if (noindexed.length > 0) {
    warns.push(`${noindexed.length} calcs root con noindex:true (¿intencional?): ${noindexed.slice(0, 10).join(', ')}${noindexed.length > 10 ? '…' : ''}`);
  }
  if (longTitles > 0) warns.push(`${longTitles} calcs root con title > 70 chars (truncan en SERP)`);
}

// ---- Reporte -------------------------------------------------------------------
for (const w of warns) console.warn(`[link-guard] ⚠ ${w}`);
for (const e of errors) console.error(`[link-guard] ✗ ${e}`);
console.log(`[link-guard] ${errors.length} errores, ${warns.length} warnings`);
if (errors.length > 0) process.exit(1);
