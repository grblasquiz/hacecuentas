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

import { readFileSync, writeFileSync, statSync, readdirSync, existsSync, unlinkSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { canDistributeCalc } from '../src/lib/content-policy.ts';
import { GONE_410_URLS } from '../src/lib/gone-410.ts';
import { PRUNING_REDIRECTS } from '../src/lib/pruning-redirects.ts';
import { DECISION_MANIFEST } from '../src/lib/decisions/manifest.ts';
import { DECISION_MANIFEST_LOCALES } from '../src/lib/decisions/manifest-locales.ts';
import { DECISION_HUBS } from '../src/lib/decisions/hubs.ts';
import { PRIORITY_DECISIONS } from '../src/lib/decisions/priority.ts';
import { PRODUCTS } from '../src/lib/products/manifest.ts';
import { VERTICALES } from '../src/lib/partners/verticales.ts';

const PRUNED_SLUGS = new Set(Object.keys(PRUNING_REDIRECTS).map((p) => p.replace(/^\//, '')));

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INFORMES_REGISTRY_PATH = join(ROOT, 'src', 'lib', 'informes', 'registry.ts');
// Extract slugs without executing the registry and its build-only formula/data imports.
const INFORME_SLUGS = [
  ...readFileSync(INFORMES_REGISTRY_PATH, 'utf8').matchAll(/\bslug:\s*'([^']+)'/g),
].map((match) => match[1]);
const CALCS_DIR = join(ROOT, 'src', 'content', 'calcs');
const CALCS_EN_DIR = join(ROOT, 'src', 'content', 'calcs-en');
const CALCS_PT_DIR = join(ROOT, 'src', 'content', 'calcs-pt');
const CALCS_PT_PT_DIR = join(ROOT, 'src', 'content', 'calcs-pt-pt');
const CALCS_MX_DIR = join(ROOT, 'src', 'content', 'calcs-mx');
const CALCS_ES_DIR = join(ROOT, 'src', 'content', 'calcs-es');
const CALCS_CO_DIR = join(ROOT, 'src', 'content', 'calcs-co');
const CALCS_CL_DIR = join(ROOT, 'src', 'content', 'calcs-cl');
const CALCS_PE_DIR = join(ROOT, 'src', 'content', 'calcs-pe');
const CALCS_EC_DIR = join(ROOT, 'src', 'content', 'calcs-ec');
const CALCS_VE_DIR = join(ROOT, 'src', 'content', 'calcs-ve');
const CALCS_PY_DIR = join(ROOT, 'src', 'content', 'calcs-py');
const CALCS_UY_DIR = join(ROOT, 'src', 'content', 'calcs-uy');
const CALCS_DO_DIR = join(ROOT, 'src', 'content', 'calcs-do');
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

function readJSONs(dir: string, pathPrefix = ''): any[] {
  return safeReadDir(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try { return JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch { return null; }
    })
    .filter(Boolean)
    // Excluimos páginas con `noindex: true` del sitemap. Si la página tiene
    // <meta name="robots" content="noindex">, listarla en el sitemap es
    // contradictorio (Google se confunde) y desperdicia crawl budget.
    // Cuando alguien des-noindexa una calc, regenerar sitemap la incluye de nuevo.
    // canDistributeCalc = !noindex && !restringida (YMYL). No confiamos sólo en
    // noindex manual: una calc ymylRisk:high sin revisor queda fuera igual.
    // OJO: `canDistributeCalc` también consulta PRUNING_REDIRECTS, así que hay que
    // pasarle el `pathPrefix`. Sin él comparaba el slug PELADO contra las claves de
    // pruning y tiraba páginas 200 legítimas por colisión de nombre: `/glosario/iva`
    // caía por la redirección raíz `/iva` → calc, y `/py/calculadora-aguinaldo-
    // paraguay` por la ES `/calculadora-aguinaldo-paraguay`. Mismo bug que el filtro
    // path-aware de abajo, que sólo cubría la mitad del camino (audit 2026-07-24).
    .filter((d: any) => canDistributeCalc(d, pathPrefix))
    // Excluimos páginas con `canonicalSlug`: son duplicados que canonicalizan a
    // OTRA URL (vienen de la unificación de similares). Listarlas en el sitemap
    // es "non-canonical page in sitemap" (Ahrefs) y desperdicia crawl budget.
    .filter((d: any) => !d.canonicalSlug)
    // Excluimos slugs en PRUNING_REDIRECTS: el JSON sigue presente para que
    // el middleware sepa redirigir, pero la URL ya no debe figurar en el sitemap.
    // path-aware: para colecciones con prefijo (glosario, comparar…) la clave de
    // pruning es la URL completa (`glosario/iva`), NO el slug pelado (`iva`).
    // Sin esto, un glosario `/glosario/iva` se excluía por colisionar con la
    // redirección raíz `/iva` → calc, aunque es una página 200 distinta.
    .filter((d: any) => {
      if (!d.slug) return true;
      const key = pathPrefix ? `${pathPrefix}/${d.slug}` : d.slug;
      return !PRUNED_SLUGS.has(key);
    });
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
 * Devuelve el lastmod editorial de un calc combinando todas las señales fiables
 * y eligiendo la más reciente.
 *
 * Política: `max(lastReviewed, dataUpdate.lastUpdated, mtime del JSON)` con
 * clamp a today. La señal más nueva gana, porque cualquiera de las tres es
 * evidencia legítima de que la calc cambió:
 *   - lastReviewed       — revisión editorial humana ("repasé esto, está OK")
 *   - dataUpdate.lastUpdated — refresh de data externa (escala AFIP, ICL, IPC)
 *   - mtime (git log)    — último commit que tocó el JSON
 *
 * Antes era prioridad secuencial (si había lastReviewed, ignoraba dataUpdate y
 * mtime). El bug era que una calc con lastReviewed=2025-01-01 y
 * dataUpdate.lastUpdated=2026-05-12 reportaba enero 2025 al sitemap aunque la
 * data se hubiera refrescado hace 1 día. Ahora gana la más nueva.
 *
 * Por qué seguimos ignorando el mtime "puro" del filesystem y usamos git log:
 * scripts de mass-edit cosmético (re-format, backfill de campos no user-facing)
 * tocan cientos de JSON en un commit. Como git log devuelve el ts del commit
 * y editorial/data tienen ts dedicado, el max() respeta el cambio real más
 * grande. Si un mass-edit toca todo el catálogo, el commit ts mueve mtime de
 * todas, pero como lastReviewed/dataUpdate están seteados a fechas anteriores
 * "reales", solo bumpea las calcs cuyo último cambio real ES ese commit.
 */
// Clamp defensivo: una fecha futura en lastmod es señal de quality issue para
// Google (visto en sitemap-calcs-finanzas.xml con lastmod 2026-05-28 cuando
// hoy era 04-05). Siempre acotamos a today.
const TODAY_ISO = new Date().toISOString().split('T')[0];
const clampToToday = (d: string) => (d > TODAY_ISO ? TODAY_ISO : d);

const DATE_RX = /^\d{4}-\d{2}-\d{2}$/;
const pickIfValid = (d: unknown): string | null =>
  typeof d === 'string' && DATE_RX.test(d) ? clampToToday(d) : null;

function getCalcLastMod(calc: any, filepath: string, fallback: string): string {
  // Política: prioridad editorial > fecha de datos > git mtime.
  //   1. Si hay lastReviewed: usar max(lastReviewed, dataUpdate.lastUpdated)
  //      — la fecha editorial gana sobre git mtime. Esto permite que
  //      mass-edits (backfill de campos como seoKeywords/lastReviewed) NO
  //      inflen el sitemap si el editorial review no cambió. Si dataUpdate
  //      es más reciente que lastReviewed, igual lo respetamos (señal de
  //      datos actualizados es más fresca que el último review humano).
  //   2. Si NO hay lastReviewed pero sí dataUpdate: usar dataUpdate.
  //   3. Si no hay ninguno: fallback a git mtime.
  //
  // Antes hacíamos `max(lastReviewed, dataUpdate, mtime)` siempre, lo que
  // significaba que cualquier commit que tocara el JSON (aún para agregar
  // un campo SEO sin cambiar contenido editorial) movía el sitemap. Eso
  // viola la rule #3 de CLAUDE.md (no inflar crawl budget de Google).
  // Una comprobación automática puede actualizar metadata, pero no prueba que
  // una persona haya vuelto a revisar el contenido. Si el origen está marcado
  // como automatizado, no usamos `lastReviewed` como señal editorial.
  const lr = calc?.editorialReviewMethod === 'automated'
    ? null
    : pickIfValid(calc?.lastReviewed);
  const du = pickIfValid(calc?.dataUpdate?.lastUpdated);

  if (lr) {
    if (du && du > lr) return du;
    return lr;
  }
  if (du) return du;

  // Sin lastReviewed ni dataUpdate: usar git mtime como última señal.
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
    const mtime = pickIfValid(getLastMod(resolved, ''));
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
  const directCandidates = [
    join(pagesDir, `${slug}.astro`),
    join(pagesDir, slug, 'index.astro'),
  ];
  const candidates = new Set<string>(directCandidates);
  const hasDirectPage = directCandidates.some((candidate) => existsSync(candidate));

  // Las guías viven en una ruta dinámica, pero cada una tiene un JSON editorial
  // propio. Usar el mtime de /guia/[slug].astro (o buildDate) haría que todas
  // parecieran modificadas juntas aunque sólo cambió una.
  if (slug.startsWith('guia/')) {
    candidates.add(join(ROOT, 'src', 'content', 'guias', `${slug.slice('guia/'.length)}.json`));
    candidates.add(join(pagesDir, 'guia', '[slug].astro'));
  }

  // Si no hay archivo de página directo, la ruta puede salir de un catch-all.
  // Su mtime es una señal real y estable; buildDate no lo es.
  if (!hasDirectPage && !slug.startsWith('guia/')) {
    const parts = slug.split('/');
    if (parts.length > 1) candidates.add(join(pagesDir, parts[0], '[...slug].astro'));
    candidates.add(join(pagesDir, '[...slug].astro'));
  }

  // Una página prerenderizada puede cambiar porque cambió el snapshot de datos
  // que importa, aunque el .astro quede intacto. Sumamos imports directos de
  // src/data y src/lib/data, pero ignoramos Layout/Header/Footer compartidos:
  // tocar chrome global no convierte cada URL en contenido nuevo.
  for (const source of [...candidates]) {
    if (!existsSync(source)) continue;
    let text = '';
    try { text = readFileSync(source, 'utf8'); } catch { continue; }
    for (const match of text.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/g)) {
      const spec = match[1].split('?')[0];
      if (!spec.startsWith('.')) continue;
      const base = resolve(dirname(source), spec);
      const resolved = [base, `${base}.ts`, `${base}.json`, `${base}.js`, `${base}.mjs`]
        .find((p) => existsSync(p));
      if (!resolved) continue;
      const rel = relative(ROOT, resolved).replace(/\\/g, '/');
      if (rel.startsWith('src/data/') || rel.startsWith('src/lib/data/')) {
        candidates.add(resolved);
      }
    }
  }

  let best = '';
  for (const c of candidates) {
    if (!existsSync(c)) continue;
    const d = getLastMod(c, '');
    if (d && d > best) best = d;
  }
  return best || fallback;
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

// News sitemap schema — Google News requiere registration vía Publisher Center
// pero Bing News + Yandex News leen el mismo formato sin opt-in. Cobertura
// principal: blog posts + calcs con dataUpdate.lastUpdated en últimos 2 días
// (refresh diario BCRA/dolar/inflación las hace news-worthy).
interface NewsEntry {
  loc: string;
  title: string;
  publicationDate: string; // ISO 8601 con timezone
  language: 'es' | 'en' | 'pt';
}
function newsSitemapXml(entries: NewsEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries.map((e) => `  <url>
    <loc>${e.loc}</loc>
    <news:news>
      <news:publication>
        <news:name>Hacé Cuentas</news:name>
        <news:language>${e.language}</news:language>
      </news:publication>
      <news:publication_date>${e.publicationDate}</news:publication_date>
      <news:title>${e.title.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!))}</news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>`;
}

// --------------------------------------------------------------------------
// Tripwire anti-churn — evita actualizaciones masivas accidentales de lastmod.
//
// `lastmod` debe ser la fecha de un cambio real, no una fecha que se va moviendo
// en cada deploy. El mecanismo anterior repartía una subida grande en varios
// builds (+N días por build): protegía contra spikes, pero hacía que una URL
// cambiara de lastmod varias veces sin contenido nuevo. Ahora publicamos la
// fecha editorial/de datos exacta y abortamos si una ejecución intenta subir
// demasiadas URLs existentes de una sola vez.
//
// State persistido en db/sitemap-state.json. Si no existe, hacemos bootstrap
// leyendo los XMLs actuales en public/. El límite puede ajustarse con
// SITEMAP_MAX_LASTMOD_UPDATES (default 250) y solo debe saltearse de forma
// consciente con SITEMAP_ALLOW_MASS_LASTMOD=1.
// --------------------------------------------------------------------------

const STATE_FILE = join(ROOT, 'db', 'sitemap-state.json');
const MAX_LASTMOD_UPDATES = (() => {
  const raw = process.env.SITEMAP_MAX_LASTMOD_UPDATES;
  if (!raw) return 250;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 250;
})();
const ALLOW_MASS_LASTMOD = process.env.SITEMAP_ALLOW_MASS_LASTMOD === '1';
const MAX_NEW_URLS = (() => {
  const raw = process.env.SITEMAP_MAX_NEW_URLS;
  if (!raw) return 100;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 100;
})();
const ALLOW_MASS_NEW_URLS = process.env.SITEMAP_ALLOW_MASS_NEW_URLS === '1';

interface SitemapState {
  // ISO timestamp del último guardado, útil para auditoría.
  savedAt: string;
  // URL → lastmod reportado en el sitemap previo. Se actualiza tras cada build.
  lastmods: Record<string, string>;
}

function bootstrapStateFromXmls(): Map<string, string> {
  const map = new Map<string, string>();
  for (const f of safeReadDir(PUBLIC_DIR)) {
    if (!f.startsWith('sitemap') || !f.endsWith('.xml')) continue;
    try {
      const xml = readFileSync(join(PUBLIC_DIR, f), 'utf8');
      const rx = /<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g;
      let m: RegExpExecArray | null;
      while ((m = rx.exec(xml)) !== null) {
        // Una URL puede aparecer en >1 sitemap (ej. /categoria/X en priority Y
        // en sitemap-calcs-X). Google ve TODOS y se queda con el más nuevo,
        // así que ese es el baseline real para nuestro cap.
        const prev = map.get(m[1]);
        if (!prev || m[2] > prev) map.set(m[1], m[2]);
      }
    } catch {}
  }
  return map;
}

function loadState(): { state: Map<string, string>; source: 'state-file' | 'xml-bootstrap' | 'fresh' } {
  if (existsSync(STATE_FILE)) {
    try {
      const raw = JSON.parse(readFileSync(STATE_FILE, 'utf8')) as SitemapState;
      return { state: new Map(Object.entries(raw.lastmods || {})), source: 'state-file' };
    } catch (err) {
      console.warn(`[sitemap] state file corrupto: ${(err as Error).message} — caigo a bootstrap`);
    }
  }
  const fromXml = bootstrapStateFromXmls();
  if (fromXml.size > 0) {
    // Tripwire: estamos SIN el state file persistido. El cap anti-churn arranca
    // del XML público (mejor que nada) pero si esto pasa en CI es señal de que
    // db/sitemap-state.json se perdió/gitignoreó — restaurarlo de git.
    console.warn(`[sitemap] ⚠ sin db/sitemap-state.json — bootstrap desde ${fromXml.size} URLs de XMLs públicos. db/sitemap-state.json DEBE estar trackeado en git (es el estado anti-churn). Ver db/README.md.`);
    return { state: fromXml, source: 'xml-bootstrap' };
  }
  console.warn('[sitemap] ⚠ sin state file ni XMLs públicos — modo FRESH: lastmod sin cap anti-churn. Esperable solo en repo limpio; en CI/prod esto puede INFLAR el sitemap (regla #1 SEO). Ver db/README.md.');
  return { state: new Map(), source: 'fresh' };
}

function saveState(used: Map<string, string>) {
  const lastmods: Record<string, string> = {};
  for (const [loc, lm] of [...used.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    lastmods[loc] = lm;
  }
  const out: SitemapState = { savedAt: new Date().toISOString(), lastmods };
  writeFileSync(STATE_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8');
}

// --------------------------------------------------------------------------
// Data loading
// --------------------------------------------------------------------------

const calcs = readJSONs(CALCS_DIR);
// Locales: leer path-aware. La URL es `/${locale}/${slug}` y las claves de
// PRUNING_REDIRECTS para locales vienen prefijadas (`/en/...`). Sin pasar el
// prefijo, una calc locale viva (ej. /en/cafeina-dosis-rendimiento) se excluía
// del sitemap por colisionar su slug pelado con una redirección ES-root
// (`/cafeina-dosis-rendimiento`). Mismo bug que el comentario de readJSONs.
const calcsEn = readJSONs(CALCS_EN_DIR, 'en');
const calcsPt = readJSONs(CALCS_PT_DIR, 'pt');
const calcsPtPt = readJSONs(CALCS_PT_PT_DIR, 'pt-pt');
const calcsMx = readJSONs(CALCS_MX_DIR, 'mx');
const calcsEs = readJSONs(CALCS_ES_DIR, 'es');
const calcsCo = readJSONs(CALCS_CO_DIR, 'co');
const calcsCl = readJSONs(CALCS_CL_DIR, 'cl');
const calcsPe = readJSONs(CALCS_PE_DIR, 'pe');
const calcsEc = readJSONs(CALCS_EC_DIR, 'ec');
const calcsVe = readJSONs(CALCS_VE_DIR, 've');
const calcsPy = readJSONs(CALCS_PY_DIR, 'py');
const calcsUy = readJSONs(CALCS_UY_DIR, 'uy');
const calcsDo = readJSONs(CALCS_DO_DIR, 'do');
const blogPosts = readJSONs(BLOG_DIR);
const blogPostsPt = readJSONs(join(ROOT, 'src', 'content', 'blog-pt'));
const tablas = readJSONs(TABLAS_DIR);
const comparaciones = readJSONs(COMPARACIONES_DIR, 'comparar');
const glosarioTerms = readJSONs(GLOSARIO_DIR, 'glosario');

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

// Sólo estas páginas incorporan datos remotos directamente durante cada build;
// para ellas buildDate sí representa un cambio real del HTML. El resto de las
// páginas antes marcadas `dynamic` usa el .astro + sus imports de datos. Esto
// evita reestampar decenas de URLs deportivas/cambiarias en cada deploy cuando
// su snapshot no cambió.
const REMOTE_BUILD_DYNAMIC_PATHS = new Set([
  '/',
  '/cambio-de-monedas',
  '/cotizacion-cripto',
  '/inflacion-argentina',
  '/comparador-plazo-fijo',
  '/plazo-fijo-vs-billeteras',
  '/euro-hoy',
  '/riesgo-pais-hoy',
]);

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
  lastmod: dynamic && REMOTE_BUILD_DYNAMIC_PATHS.has(path)
    ? buildDate
    : getPageLastMod(path, buildDate),
});
const priorityUrls: Url[] = [
  prio('/',                                  '1.0',  'daily',  true),
  prio('/guias',                             '0.95', 'weekly'),
  prio('/cambio-de-monedas',                 '0.95', 'hourly', true),
  prio('/cotizacion-cripto',                 '0.95', 'hourly', true),
  prio('/inflacion-argentina',               '0.95', 'daily',  true),
  prio('/presupuesto-familiar',              '0.95', 'weekly'),
  prio('/simulador-jubilacion-anses',        '0.95', 'weekly'),
  prio('/planificador-de-objetivos',         '0.9',  'weekly'),
  prio('/comparador-plazo-fijo',             '0.9',  'daily',  true),
  prio('/plazo-fijo-vs-billeteras',          '0.9',  'daily',  true),
  prio('/calculadora-cientifica',            '0.9',  'weekly'),
  prio('/calculadora-derivadas',             '0.9',  'monthly'),
  prio('/resolver-ecuaciones',               '0.9',  'monthly'),
  prio('/calculadora-integrales',            '0.9',  'monthly'),
  prio('/simplificar-expresiones',           '0.85', 'monthly'),
  prio('/convertir-imagen-a-pdf',            '0.85', 'monthly'),
  prio('/deportes',                          '0.95', 'weekly'),
  prio('/calculadora-formula-1',             '0.85', 'weekly'),
  prio('/formula-1-2026',                    '0.95', 'daily',  true),
  prio('/nba-2026',                          '0.95', 'daily',  true),
  prio('/futbol-argentino-hoy',              '0.95', 'daily',  true),
  prio('/futbol-hoy',                        '0.95', 'daily',  true),
  ...['/mx/futbol-mexicano-hoy','/co/futbol-colombiano-hoy','/cl/futbol-chileno-hoy','/pe/futbol-peruano-hoy','/ec/futbol-ecuatoriano-hoy','/ve/futbol-venezolano-hoy','/py/futbol-paraguayo-hoy','/uy/futbol-uruguayo-hoy','/es/futbol-espanol-hoy','/pt/futebol-brasileiro-hoje','/pt-pt/futebol-portugues-hoje','/en/football-today'].map(path => prio(path, '0.9', 'daily', true)),
  prio('/en/nfl-2026',                       '0.9',  'daily',  true),
  prio('/alertas',                           '0.8',  'monthly'),
  prio('/valores-bcra',                      '0.9',  'daily',  true),
  prio('/cuanto-perdio-tu-sueldo',           '0.95', 'daily',  true),
  prio('/reloj-inflacion-argentina',         '0.9',  'daily',  true),
  prio('/dolar-hoy',                         '0.95', 'daily',  true),
  prio('/euro-hoy',                          '0.9',  'daily',  true),
  prio('/riesgo-pais-hoy',                   '0.9',  'daily',  true),
  prio('/dolar-hoy-chile',                   '0.9',  'daily',  true),
  prio('/dolar-hoy-colombia',                '0.9',  'daily',  true),
  prio('/dolar-hoy-mexico',                  '0.9',  'daily',  true),
  prio('/dolar-hoy-peru',                    '0.9',  'daily',  true),
  prio('/dolar-hoy-venezuela',               '0.9',  'daily',  true),
  prio('/dolar-hoy-uruguay',                 '0.9',  'daily',  true),
  prio('/dolar-hoy-paraguay',                '0.9',  'daily',  true),
  prio('/precio-nafta-hoy',                  '0.9',  'weekly', true),
  prio('/fixture-mundial-2026',              '0.95', 'daily',  true),
  prio('/partidos-hoy-mundial-2026',         '0.95', 'daily',  true),
  prio('/donde-ver-mundial-2026',            '0.9',  'daily',  true),
  // Receso escolar de invierno 2026 (ola de demanda jun-jul, fechas oficiales por provincia)
  prio('/vacaciones-invierno-2026',          '0.9',  'weekly', true),
  // Hub temático asado/fiesta/evento (cluster de ~40 calcs por invitado, alta intención de finde)
  prio('/calculadoras-evento',               '0.8',  'monthly'),
  // Meta-hub de fin de semana (clusters resilientes: cocina, escapadas, fitness, ocio, mascotas)
  prio('/calculadoras-fin-de-semana',        '0.8',  'monthly'),
  // Sub-hubs de fin de semana por intención (comida, fiestas, escapadas, proyectos)
  prio('/fin-de-semana',                     '0.8',  'monthly'),
  prio('/fin-de-semana/comida-y-juntadas',   '0.8',  'monthly'),
  prio('/fin-de-semana/fiestas-y-reuniones', '0.8',  'monthly'),
  prio('/fin-de-semana/escapadas',           '0.8',  'monthly'),
  prio('/fin-de-semana/proyectos-en-casa',   '0.8',  'monthly'),
  // Landings de feriados LATAM 2026 (evergreen del año, alta intención)
  // Hub desambiguador para «feriados 2026» / «calendario 2026» (queries sin país)
  prio('/feriados-2026',                     '0.85', 'weekly'),
  prio('/feriados-mexico-2026',              '0.85', 'weekly'),
  prio('/feriados-colombia-2026',            '0.85', 'weekly'),
  prio('/feriados-chile-2026',               '0.85', 'weekly'),
  prio('/feriados-peru-2026',                '0.85', 'weekly'),
  prio('/feriados-ecuador-2026',             '0.85', 'weekly'),
  // Mayor oportunidad Bing viva: 89.702 impresiones, posición 3,8 y CTR 1,3%.
  // Se envía el canonical informativo; nunca los aliases de calculadoras podadas.
  prio('/co/datos-salario-minimo-colombia-2026', '0.95', 'weekly'),
  prio('/argentina/cordoba/calculadora-ingresos-brutos-provincial', '0.85', 'monthly'),
  prio('/co/calculadora-tarifa-taxi-bogota-2026-unidades-recargos', '0.85', 'monthly'),
  prio('/tabla/tabla-escalas-ganancias-2026', '0.85', 'monthly'),
  // guías pilares (estables)
  prio('/guia/finanzas-personales',          '0.9',  'weekly'),
  prio('/guia/marketing-roi-metricas',       '0.9',  'weekly'),
  prio('/guia/inversion-inmobiliaria',       '0.9',  'weekly'),
  prio('/guia/sueldos-argentina-2026',       '0.9',  'weekly'),
  prio('/guia/impuestos-argentina-2026',     '0.9',  'weekly'),
  prio('/guia/subsidios-anses-2026',         '0.9',  'weekly'),
  prio('/guia/salud-nutricion-fitness',      '0.9',  'weekly'),
  prio('/guia/embarazo-y-bebe',              '0.9',  'weekly'),
  prio('/guia/construccion-diy-hogar',       '0.9',  'weekly'),
  prio('/guia/matematicas-ciencias',         '0.9',  'weekly'),
  prio('/guia/productividad-aprendizaje',    '0.9',  'weekly'),
  prio('/guia/cocina-medidas-recetas',       '0.9',  'weekly'),
  prio('/guia/vida-cotidiana',               '0.9',  'weekly'),
  prio('/guia/mascotas',                     '0.9',  'weekly'),
  prio('/guia/viajes',                       '0.9',  'weekly'),
  prio('/guia/negocios-e-independientes-2026', '0.9', 'weekly'),
  prio('/guia/tecnologia-electronica',       '0.9',  'weekly'),
  prio('/guia/deportes-fitness',             '0.9',  'weekly'),
  prio('/guia/auto-y-movilidad',             '0.9',  'weekly'),
  prio('/guia/sueldos-impuestos-peru-2026',  '0.9',  'weekly'),
  prio('/guia/sueldos-impuestos-ecuador-2026', '0.9', 'weekly'),
  // guías nuevas del lote fin-de-semana / vida cotidiana (evergreen)
  prio('/guia/comida-reunion-cuanto-comprar',                    '0.85', 'monthly'),
  prio('/guia/presupuesto-fiesta-como-armar',                    '0.85', 'monthly'),
  prio('/guia/dividir-gastos-amigos-sin-errores',                '0.85', 'monthly'),
  prio('/guia/presupuesto-viaje-completo',                       '0.85', 'monthly'),
  prio('/guia/combustible-peajes-costo-por-persona-viaje',       '0.85', 'monthly'),
  prio('/guia/pintar-casa-materiales-litros',                    '0.85', 'monthly'),
  prio('/guia/estimar-materiales-construccion-sin-comprar-de-mas', '0.85', 'monthly'),
  prio('/guia/fondo-emergencia-como-calcular',                   '0.85', 'monthly'),
];
// Las salas P0 de /decidir salieron del sitemap el 28-07-2026 junto con el
// resto de /decidir/*: la sección se dio de baja y sus 68 URLs son 301 al hub
// que responde la misma pregunta. El manifest sigue importado porque alimenta
// los backlinks contextuales de las calcs y el copy de otros componentes.
// Las /categoria/* se dieron de baja el 28-07-2026: se generaban desde las calcs
// sueltas de AR y, consolidadas en hubs, quedaron vacías. Hoy son 301 al silo
// equivalente, así que no van al sitemap — una URL que redirige no se envía a
// indexar. Los silos de hubs ya entran por su propio bloque.
// Top calcs estrella verificadas (slugs reales — chequear con dist/ si agregás)
// Expanded 2026-05-11: agregadas 22 CTR-rewritten + 45 con Information Gain (datos live)
// Bing crawlea sitemap-priority 3-5x más frecuente que sitemaps por categoría.
const topPrioritySlugs = [
  // === Top performers historicos ===
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
  // === CTR-rewritten 2026-05-11 (striking distance GSC) ===
  'calculadora-conversor-metros-lineales-a-metros-cuadrados',
  'calculadora-cuantos-dias-faltan-Navidad-2026',
  'dias-entre-dos-fechas',
  'calculadora-edad-humana-conejo-anos',
  'calculadora-calorias-quemadas-deporte',
  'calculadora-twitch-bits-donaciones-dolares',
  'calculadora-pace-ritmo-running',
  'calculadora-bebidas-evento-litros-por-persona',
  'calculadora-twitter-x-monetizacion-ingreso',
  'calculadora-duracion-bateria-mah-consumo',
  'calculadora-tiempo-lectura-paginas-estudio',
  'calculadora-costo-m2-construccion-argentina',
  'calculadora-conversor-mb-a-gb',
  'calculadora-palabras-paginas-conversor',
  'calculadora-rendimiento-masa-empanadas-cantidad',
  'calculadora-estimador-costo-viaje-taxi-remis',
  'calculadora-arboles-compensar-co2-huella',
  'calculadora-tejas-techo-m2',
  // === Information Gain (dataSource: dolar/inflacion/UVA/tasas live) ===
  'calculadora-sueldo-dolarizado-vs-pesos-argentina-comparativa',
  'calculadora-dolar-mep-cocos-iol-comision-real',
  'calculadora-prestamo-personal-cuota-mensual',
  'calculadora-ahorro-uva-vs-pesos-vs-dolar-12-meses',
  'calculadora-dolar-bolsa-vs-cripto-arbitraje-spread-real',
  'calculadora-sueldo-programador-desarrollador-argentina-seniority',
  'calculadora-dolar-blue-vs-oficial-brecha',
  'calculadora-cuotas-sin-interes-vs-contado-inflacion-argentina',
  'calculadora-retorno-real-inversion-descontando-inflacion',
  'calculadora-inflacion-perdida-poder-adquisitivo',
  'calculadora-impuesto-pais-percepcion-dolar-tarjeta',
  'calculadora-hipoteca-uva-santander-argentina',
  'calculadora-sueldo-docente-argentina-cargo-antiguedad',
  'calculadora-dolar-soja-exportador-diferencia',
  'calculadora-prestamo-personal-galicia-vs-santander-cuota',
  'calculadora-estimador-sueldo-programador-stack-argentina',
  'calculadora-dolar-mep-paso-a-paso-costo-operacion',
  'calculadora-inflacion-poder-compra',
  'calculadora-cuota-credito-hipotecario-uva-banco-nacion',
  'calculadora-ajuste-sueldo-inflacion',
  'calculadora-cft-prestamo-personal-comparativa',
  'calculadora-credito-uva-vs-tasa-fija',
  'calculadora-reajuste-arriendo-chile-ipc-sii',
  'conversor-moneda-dolar-peso-real-latam',
  'calculadora-ingreso-minimo-credito-hipotecario-uva-banco-nacion',
  'calculadora-actualizacion-inflacion-ipc',
  'calculadora-sueldo-actualizado-ipc-inflacion',
  'calculadora-hipoteca-divisa-extranjera-vs-uva',
  'calculadora-precio-dolar-producto',
  'conversor-dolar-argentina',
  'calculadora-credito-uva-cuota-actual',
  'calculadora-spread-tasas-arbitraje-bancos-plazo-fijo',
  'calculadora-tarifa-freelance-dolar-experiencia-hora',
  'calculadora-percepcion-dolar-tarjeta-impuesto-pais',
  'calculadora-salario-real-inflacion',
  'calculadora-uva-hipoteca-vs-inflacion-riesgo',
  'calculadora-hipoteca-uva-bbva-argentina',
  'calculadora-plazo-fijo-uva-precancelable-rendimiento',
  'calculadora-plazo-fijo-ganancia-neta-anual',
  'calculadora-cuotas-sin-interes-costo-real-inflacion',
  'calculadora-sueldo-minimo-liga-profesional-argentina-afa',
  // === Top 12 por GA4 views (1 abr - 11 may 2026) que faltaban en priority ===
  'calculadora-actualizacion-alquiler-icl',
  'calculadora-indice-masa-corporal-pediatrico',
  'calculadora-feriados-argentina-2026-calendario',
  'calculadora-edad-en-semanas',
  'calculadora-peso-ideal',
  'calculadora-sueldo-neto-chile-2026',
  'calculadora-liquidacion-final-renuncia',
  'calculadora-edad-perro-humano',
  'calculadora-peso-ideal-bebe-mes-percentil',
  'calculadora-proteina-gramos-por-peso-actividad',
  'calculadora-semanas-embarazo',
  'calculadora-vacaciones-argentina',
  // === Recuperación GSC julio 2026: URLs probadas por Google (pos 8-13, CTR bajo) ===
  // Slugs canónicos verificados contra dist/ — los duplicados GSC (combustible-viaje-auto,
  // impuesto-sellos, tazas-gramos, mercadolibre, seguro-auto, dividir-gastos) entran por
  // su canonical, no por el alias.
  'calculadora-indice-asistencia-faltas',
  'calculadora-millas-latam-destino',
  'calculadora-video-bitrate-tamano-archivo',
  'calculadora-sueldo-por-hora',
  'calculadora-costo-por-kilometro-auto',
  'calculadora-patente-auto-provincia',
  'calculadora-costo-viaje-combustible-kilometros',
  'calculadora-sellos-compra-inmueble-caba-pba',
  'calculadora-comision-venta-vendedor',
  'calculadora-propina-por-pais-viaje',
  'calculadora-consumo-electrico-aparato-kwh-mes',
  'calculadora-split-gastos-grupo-amigos',
  'calculadora-conversion-medidas-cocina-tazas-gramos',
  'calculadora-seguro-auto-estimado',
];
const calcBySlug = new Map((calcs as any[]).map((c: any) => [c.slug, c]));
// Todos los slugs de src/content/calcs SIN filtrar por distribución. Sirve para
// distinguir "raíz retirada del sitemap" (existe pero noindex/podada) de "raíz
// que nunca existió" — ver el gate de las páginas provinciales más abajo.
const allCalcSlugs = new Set<string>(
  safeReadDir(CALCS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try { return JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8')).slug as string; } catch { return ''; }
    })
    .filter(Boolean),
);
const seenInPriority = new Set<string>(topPrioritySlugs);
for (const slug of topPrioritySlugs) {
  const c = calcBySlug.get(slug);
  if (!c) continue;
  // Nunca listar URLs cuyo canonical apunta a otra página — el sitemap solo lleva canonicals.
  if (c.canonicalSlug && c.canonicalSlug !== slug) {
    console.warn(`⚠ sitemap-priority: '${slug}' tiene canonicalSlug='${c.canonicalSlug}' — se omite (agregá el canonical en su lugar)`);
    continue;
  }
  const fp = join(CALCS_DIR, `${c.formulaId || c.slug}.json`);
  priorityUrls.push({
    loc: `${site}/${slug}`,
    priority: '0.9',
    changefreq: 'weekly',
    lastmod: getCalcLastMod(c, fp, buildDate),
  });
}

// Auto-expand top 50 por score de completitud (proxy de "calcs maduras"):
// example.steps + sources + faq + useCases + keyTakeaway + explanation > 1500 chars.
// Solo agrega slugs no presentes ya en topPrioritySlugs ni noindex.
function completenessScore(c: any): number {
  let s = 0;
  if (c.example?.steps?.length) s += 2;
  if (c.sources?.length >= 2) s += 2;
  if (c.faq?.length >= 7) s += 2;        // feedback FAQ min 7
  if (c.useCases?.length >= 4) s += 1;
  if (c.keyTakeaway) s += 1;
  if (c.explanation && c.explanation.length > 1500) s += 2;
  if (c.lastReviewed) s += 1;
  if (c.dataUpdate?.lastUpdated) s += 1;  // live data signal
  return s;
}
const autoTopPriority = (calcs as any[])
  .filter((c) => canDistributeCalc(c) && !seenInPriority.has(c.slug))
  .map((c) => ({ c, score: completenessScore(c) }))
  .filter((x) => x.score >= 8)
  .sort((a, b) => b.score - a.score)
  .slice(0, 50);
for (const { c } of autoTopPriority) {
  const fp = join(CALCS_DIR, `${c.formulaId || c.slug}.json`);
  priorityUrls.push({
    loc: `${site}/${c.slug}`,
    priority: '0.85',
    changefreq: 'weekly',
    lastmod: getCalcLastMod(c, fp, buildDate),
  });
}
console.log(`📌 sitemap-priority.xml: ${topPrioritySlugs.length} curated + ${autoTopPriority.length} auto-completeness`);

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
  lastmod: dynamic && REMOTE_BUILD_DYNAMIC_PATHS.has(path)
    ? buildDate
    : getPageLastMod(path, buildDate),
});
sitemaps.push({
  name: 'sitemap-core.xml',
  urls: [
    core('/',                                    '1.0',  'daily',   true),
    // Pilares (jul-2026): los 4 hubs que concentran la autoridad interna.
    core('/sueldos-y-trabajo',                   '0.95', 'weekly'),
    core('/impuestos-argentina',                 '0.95', 'weekly'),
    core('/finanzas-personales',                 '0.95', 'weekly'),
    // Hubs institucionales AR (ago-2026): recorridos completos y canónicos.
    core('/trabajo/accidente-laboral',            '0.88', 'monthly'),
    core('/impuestos/elegir-regimen',             '0.88', 'monthly'),
    core('/finanzas-personales/perfil-crediticio','0.88', 'monthly'),
    core('/familia/tener-un-hijo',                '0.88', 'monthly'),
    core('/hogar/subsidios-energia',              '0.88', 'monthly'),
    core('/trabajo/contratar-personal-casas-particulares', '0.88', 'monthly'),
    core('/familia/fallecimiento-y-tramites',     '0.88', 'monthly'),
    core('/negocios-e-independientes',           '0.95', 'weekly'),
    core('/deportes',                            '0.95', 'weekly'),
    core('/buscar',                        '0.9',  'weekly'),
    core('/glosario',                            '0.8',  'monthly'),
    core('/populares',                           '0.85', 'weekly'),
    core('/comparador-plazo-fijo',               '0.85', 'daily',   true),
    core('/calculadora-cientifica',              '0.85', 'weekly'),
    core('/calculadora-derivadas',               '0.85', 'monthly'),
    core('/resolver-ecuaciones',                 '0.85', 'monthly'),
    core('/calculadora-integrales',              '0.85', 'monthly'),
    core('/simplificar-expresiones',             '0.8',  'monthly'),
    core('/convertir-imagen-a-pdf',              '0.8',  'monthly'),
    core('/calculadora-formula-1',               '0.8',  'weekly'),
    core('/alertas',                             '0.75', 'monthly'),
    core('/valores-bcra',                        '0.85', 'daily',   true),
    core('/cambio-de-monedas',                   '0.95', 'hourly',  true),
    core('/cotizacion-cripto',                   '0.95', 'hourly',  true),
    core('/inflacion-argentina',                 '0.9',  'daily',   true),
    core('/presupuesto-familiar',                '0.95', 'weekly'),
    core('/simulador-jubilacion-anses',          '0.95', 'weekly'),
    core('/planificador-de-objetivos',           '0.9',  'weekly'),
    core('/tracker-embarazo-semana-a-semana',    '0.95', 'weekly'),
    core('/cuanto-falta-para-Navidad-2026',      '0.9',  'daily',   true),
    core('/fixture-mundial-2026',                '0.9',  'daily',   true),
    core('/partidos-hoy-mundial-2026',           '0.92', 'daily',   true),
    core('/donde-ver-mundial-2026',              '0.9',  'daily',   true),
    core('/vacaciones-invierno-2026',            '0.88', 'weekly',  true),
    core('/posiciones-mundial-2026',             '0.9',  'daily',   true),
    core('/goleadores-mundial-2026',             '0.85', 'daily',   true),
    core('/cuando-juega-argentina-mundial-2026', '0.9',  'daily',   true),
    core('/cuando-juega-mexico-mundial-2026',    '0.88', 'daily',   true),
    core('/cuando-juega-colombia-mundial-2026',  '0.88', 'daily',   true),
    core('/cuando-juega-uruguay-mundial-2026',   '0.86', 'daily',   true),
    core('/cuando-juega-paraguay-mundial-2026',  '0.86', 'daily',   true),
    core('/cuando-juega-espana-mundial-2026',    '0.86', 'daily',   true),
    core('/llave-mundial-2026',                  '0.85', 'daily',   true),
    core('/campeon-mundial-2026',                '0.9',  'daily',   true),
    core('/balon-de-oro-mundial-2026',           '0.86', 'daily',   true),
    core('/mundial-2026',                        '0.85', 'weekly'),
    core('/guias',                               '0.9',  'weekly'),
    core('/guia/sueldos-argentina-2026',         '0.85', 'weekly'),
    core('/guia/impuestos-argentina-2026',       '0.85', 'weekly'),
    core('/guia/subsidios-anses-2026',           '0.85', 'weekly'),
    core('/guia/finanzas-personales',            '0.85', 'weekly'),
    core('/guia/marketing-roi-metricas',         '0.85', 'weekly'),
    core('/guia/inversion-inmobiliaria',         '0.85', 'weekly'),
    core('/guia/salud-nutricion-fitness',        '0.85', 'weekly'),
    core('/guia/embarazo-y-bebe',                '0.85', 'weekly'),
    core('/guia/construccion-diy-hogar',         '0.85', 'weekly'),
    core('/guia/matematicas-ciencias',           '0.85', 'weekly'),
    core('/guia/productividad-aprendizaje',      '0.85', 'weekly'),
    core('/guia/cocina-medidas-recetas',         '0.85', 'weekly'),
    core('/guia/vida-cotidiana',                 '0.85', 'weekly'),
    core('/guia/mascotas',                       '0.85', 'weekly'),
    core('/guia/viajes',                         '0.85', 'weekly'),
    core('/argentina/cordoba/calculadora-ingresos-brutos-provincial', '0.85', 'monthly'),
    core('/global',                              '0.9',  'weekly',  true),
    core('/es/calculadoras',                     '0.85', 'weekly',  true),
    core('/es/datos-cuota-autonomos-2026',       '0.8',  'monthly', true),
    core('/cl/calculadoras',                     '0.85', 'weekly',  true),
    core('/cl/datos-sueldo-chile-2026',          '0.8',  'monthly', true),
    core('/co/calculadoras',                     '0.85', 'weekly',  true),
    core('/co/datos-salario-minimo-colombia-2026','0.8', 'monthly', true),
    core('/mx/calculadoras',                     '0.85', 'weekly',  true),
    core('/mx/datos-salario-minimo-mexico-2026', '0.8',  'monthly', true),
    core('/mx/datos-uma-imss-2026',              '0.8',  'monthly', true),
    core('/mx/calculadora-salario-diario-integrado-sdi-mexico', '0.9', 'monthly', true),
    core('/pe/calculadoras',                     '0.85', 'weekly',  true),
    core('/pe/datos-sueldo-minimo-peru-2026',    '0.8',  'monthly', true),
    core('/pe/datos-soat-uit-peru-2026',         '0.8',  'monthly', true),
    core('/ec/datos-pension-alimenticia-ecuador-2026', '0.8', 'monthly', true),
    core('/pe/validar-ruc',                      '0.8',  'monthly'),
    core('/calculadora-consumo-electrodomesticos', '0.9', 'monthly'),
    core('/plazo-fijo-banco-nacion',             '0.9',  'daily'),
    core('/plazo-fijo-banco-provincia',          '0.8',  'daily'),
    core('/plazo-fijo-bbva',                     '0.8',  'daily'),
    core('/plazo-fijo-banco-macro',              '0.8',  'daily'),
    core('/plazo-fijo-santander',                '0.8',  'daily'),
    core('/plazo-fijo-galicia',                  '0.8',  'daily'),
    core('/plazo-fijo-banco-ciudad',             '0.8',  'daily'),
    core('/validar-cuit',                        '0.8',  'monthly'),
    core('/validar-cbu',                         '0.8',  'monthly'),
    core('/cl/validar-rut',                      '0.8',  'monthly'),
    core('/co/validar-nit',                      '0.8',  'monthly'),
    core('/uy/validar-cedula',                   '0.8',  'monthly'),
    core('/ec/calculadoras',                     '0.85', 'weekly',  true),
    core('/ec/validar-cedula',                   '0.8',  'monthly'),
    core('/ve/calculadoras',                     '0.85', 'weekly',  true),
    core('/py/calculadoras',                     '0.85', 'weekly',  true),
    core('/uy/calculadoras',                     '0.85', 'weekly',  true),
    core('/do/calculadoras',                     '0.85', 'weekly',  true),
    core('/pt-pt/calculadoras',                  '0.85', 'weekly',  true),
    core('/pt-pt/calculadora-salario-minimo-portugal-hora', '0.9', 'monthly', true),
    core('/calculadora-honorarios-abogado',       '0.85', 'monthly', true),
    core('/calculadora-impuesto-renta-colombia-persona-natural-2026', '0.85', 'monthly', true),
    core('/co/calculadora-tabla-impuesto-renta-personas-naturales-colombia-2026', '0.85', 'monthly', true),
    core('/dias-entre-dos-fechas',                '0.85', 'monthly', true),
    core('/en/pregnancy-week-calculator',         '0.85', 'monthly', true),
    core('/mx/calculadora-costo-licencia-conducir-mexico-por-estado', '0.85', 'monthly', true),
    // Los homes de locale (/mx /co /cl /es /pt /en /ve, etc.) NO se listan
    // acá: cada sitemap-<locale>.xml ya
    // publica su home (sitemapForLocale con withIndex), heredando el lastmod
    // del cambio más reciente del locale. Estaban duplicados acá con
    // priority/lastmod en conflicto —y /es y /mx además con dynamic=true, que
    // les ponía lastmod=hoy en cada build. El duplicado no se veía porque el
    // filtro de _redirects los borraba de los dos lados (bug del trailing slash).
    core('/calculadora',                         '0.75', 'monthly'),
    core('/embeber',                             '0.6',  'monthly'),
    core('/enlazanos',                           '0.5',  'monthly'),
    core('/partners',                            '0.7',  'monthly'),
    core('/wordpress',                           '0.75', 'weekly'),
    core('/sobre-nosotros',                      '0.5',  'yearly'),
    core('/privacidad',                          '0.3',  'yearly'),
    core('/cookies',                             '0.3',  'yearly'),
    core('/terminos',                            '0.3',  'yearly'),
    core('/aviso-legal',                         '0.5',  'yearly'),
    core('/politica-editorial',                  '0.5',  'monthly'),
    core('/metodologia',                         '0.5',  'monthly'),
    core('/cooperativa-de-datos',                '0.7',  'weekly'),
    core('/contacto',                            '0.4',  'yearly'),
    core('/sugerir',                             '0.6',  'weekly'),
    core('/blog',                                '0.7',  'weekly'),
    core('/datasets',                            '0.6',  'monthly'),
    // Los hubs de vertical (/mx /co /cl /es /pt /en) NO van acá: cada
    // sitemap-<locale>.xml ya publica su home vía sitemapForLocale(withIndex),
    // con un lastmod que hereda el cambio más reciente del locale. Listarlos
    // también en core duplicaba la URL con priority/lastmod en conflicto.
    // Páginas de datos/actualidad y curadurías que no estaban listadas.
    core('/valores-vigentes',                    '0.8',  'weekly'),
    core('/que-sueldo-necesito',                 '0.75', 'monthly'),
    core('/vencimientos-afip-2026',              '0.7',  'monthly'),
    core('/recategorizacion-monotributo-julio-2026', '0.7', 'monthly'),
    core('/wizard/que-monotributo-me-conviene-2026', '0.7', 'monthly'),
    core('/calendarios',                         '0.7',  'monthly'),
    core('/informes',                            '0.6',  'monthly'),
    core('/desarrolladores',                     '0.6',  'monthly'),
    // E-E-A-T: la bio del autor sostiene el authorship de todo el sitio.
    core('/autores/martin-rodriguez',            '0.5',  'monthly'),
    core('/prensa',                              '0.5',  'monthly'),
    core('/datos-monotributo-2026',              '0.7',  'monthly'),
    core('/datos-ganancias-2026',                '0.7',  'monthly'),
    core('/datos-topes-sipa-2026',               '0.7',  'monthly'),
    core('/datos-aguinaldo-2026',                '0.7',  'monthly'),
    core('/aumento-jubilaciones',                '0.9',  'daily',   true),
    core('/calendario-pagos-anses-agosto-2026',  '0.8',  'weekly'),
    core('/calendario-pagos-anses-septiembre-2026', '0.8', 'weekly'),
    core('/dia-del-nino-2026-cuando-es',         '0.8',  'weekly'),
    core('/aguinaldo-diciembre-2026',            '0.85', 'weekly'),
    core('/datos-salario-minimo-latam-2026',     '0.7',  'monthly'),
    core('/prestaciones-laborales-por-pais',     '0.7',  'monthly'),
    core('/pt/dados-inss-irrf-2026',             '0.7',  'monthly'),
    core('/pt/validar-cnpj',                     '0.8',  'monthly'),
    core('/pt/validar-cpf',                      '0.8',  'monthly'),
    core('/pt/dados-ipca-brasil-historico',      '0.7',  'monthly'),
    core('/datos-bienes-personales-2026',        '0.7',  'monthly'),
    core('/pt/dados-salario-minimo-brasil-2026', '0.7',  'monthly'),
    core('/pt/quando-joga-brasil-copa-2026',     '0.9',  'daily',   true),
    core('/datos-salario-basico-ecuador-2026',   '0.7',  'monthly'),
    core('/feriados-2026',                       '0.8',  'weekly'),
    core('/feriados-mexico-2026',                '0.8',  'weekly'),
    core('/feriados-colombia-2026',              '0.8',  'weekly'),
    core('/feriados-chile-2026',                 '0.8',  'weekly'),
    core('/feriados-peru-2026',                  '0.8',  'weekly'),
    core('/feriados-ecuador-2026',               '0.8',  'weekly'),
    core('/euro-hoy',                            '0.85', 'daily',   true),
    core('/riesgo-pais-hoy',                     '0.85', 'daily',   true),
    core('/dolar-hoy-chile',                     '0.85', 'daily',   true),
    core('/dolar-hoy-colombia',                  '0.85', 'daily',   true),
    core('/dolar-hoy-mexico',                    '0.85', 'daily',   true),
    core('/dolar-hoy-peru',                      '0.85', 'daily',   true),
    core('/dolar-hoy-venezuela',                 '0.85', 'daily',   true),
    core('/dolar-hoy-uruguay',                   '0.85', 'daily',   true),
    core('/dolar-hoy-paraguay',                  '0.85', 'daily',   true),
  ],
});

// 2. Calcs por categoría (un sitemap por categoría)
const byCat: Record<string, any[]> = {};
for (const c of calcs as any[]) {
  // La categoría también es parte del nombre del archivo. Normalizarla evita
  // que un valor como "Impuestos" genere sitemap-calcs-Impuestos.xml mientras
  // el índice/servidor esperan sitemap-calcs-impuestos.xml (Linux es case-sensitive).
  const cat = String(c.category || 'otros')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'otros';
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
  const catLastmod = maxLastmod(calcUrls, buildDate);
  const catUrl: Url = {
    loc: `${site}/categoria/${cat}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: catLastmod,
  };
  // Páginas paginadas: /categoria/{cat}/{N} para N>=2 si la categoría
  // tiene más de PAGE_SIZE calcs. Coincide con PAGE_SIZE en [...page].astro.
  const PAGE_SIZE = 60;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pagerUrls: Url[] = [];
  for (let i = 2; i <= totalPages; i++) {
    pagerUrls.push({
      loc: `${site}/categoria/${cat}/${i}`,
      priority: '0.6',
      changefreq: 'weekly',
      lastmod: catLastmod,
    });
  }
  // /categoria/<cat>/top — ranking por uso real (intent distinto al listado:
  // "las más usadas de X"). Existía indexable pero fuera del sitemap y sin un
  // solo link entrante; ahora la enlaza el hub de categoría.
  const topUrl: Url = {
    loc: `${site}/categoria/${cat}/top`,
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: catLastmod,
  };
  sitemaps.push({ name: `sitemap-calcs-${cat}.xml`, urls: [catUrl, ...pagerUrls, topUrl, ...calcUrls] });
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
          loc: `${site}/${locale}`,
          priority: '0.8',
          changefreq: 'weekly',
          lastmod: maxLastmod(calcUrls, buildDate),
        },
        ...calcUrls,
      ]
    : calcUrls;
  return { name: `sitemap-${locale}.xml`, urls };
}

// `en` era el único locale sin home en su sitemap. /en responde 200, es
// self-canonical e indexable igual que el resto, así que quedaba fuera del
// sitemap (y del push a IndexNow) sin motivo.
if (calcsEn.length > 0) sitemaps.push(sitemapForLocale(calcsEn, 'en', CALCS_EN_DIR, true));
if (calcsPt.length > 0) sitemaps.push(sitemapForLocale(calcsPt, 'pt', CALCS_PT_DIR, true));
if (calcsMx.length > 0) sitemaps.push(sitemapForLocale(calcsMx, 'mx', CALCS_MX_DIR, true));
if (calcsEs.length > 0) sitemaps.push(sitemapForLocale(calcsEs, 'es', CALCS_ES_DIR, true));
if (calcsCo.length > 0) sitemaps.push(sitemapForLocale(calcsCo, 'co', CALCS_CO_DIR, true));
if (calcsCl.length > 0) sitemaps.push(sitemapForLocale(calcsCl, 'cl', CALCS_CL_DIR, true));
if (calcsPe.length > 0) sitemaps.push(sitemapForLocale(calcsPe, 'pe', CALCS_PE_DIR, true));
if (calcsEc.length > 0) sitemaps.push(sitemapForLocale(calcsEc, 'ec', CALCS_EC_DIR, true));
if (calcsVe.length > 0) sitemaps.push(sitemapForLocale(calcsVe, 've', CALCS_VE_DIR, true));
if (calcsPy.length > 0) sitemaps.push(sitemapForLocale(calcsPy, 'py', CALCS_PY_DIR, true));
if (calcsUy.length > 0) sitemaps.push(sitemapForLocale(calcsUy, 'uy', CALCS_UY_DIR, true));
if (calcsDo.length > 0) sitemaps.push(sitemapForLocale(calcsDo, 'do', CALCS_DO_DIR, true));
if (calcsPtPt.length > 0) sitemaps.push(sitemapForLocale(calcsPtPt, 'pt-pt', CALCS_PT_PT_DIR, true));

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

// 4b. News sitemap — formato Google News (Bing/Yandex News también lo leen).
// Entries: blog posts publicados últimos 2 días + calcs con dataUpdate
// .lastUpdated en últimos 2 días (fresh live data signals: dolar, BCRA, IPC).
// Si no hay entries fresh, no escribimos el archivo (Google News penaliza
// sitemaps vacíos o con artículos > 2 días).
{
  const now = Date.now();
  const TWO_DAYS_MS = 2 * 24 * 3600 * 1000;
  // Blog: ventana 7d para que el sitemap-news NUNCA quede 404 entre notas (Google
  // News usa las <48h e ignora el resto sin penalizar; Bing/Yandex sí leen las más
  // viejas). Un feed vivo permanente >> uno que aparece y desaparece (mata Discover).
  const BLOG_WINDOW_MS = 7 * 24 * 3600 * 1000;
  const newsEntries: NewsEntry[] = [];

  // Blog posts fresh
  for (const p of (blogPosts as any[])) {
    const dateStr = p.updatedDate || p.date;
    if (!dateStr) continue;
    const t = Date.parse(dateStr);
    if (Number.isNaN(t) || now - t > BLOG_WINDOW_MS) continue;
    newsEntries.push({
      loc: `${site}/blog/${p.slug}`,
      // ogTitle = headline limpio sin sufijo "| Hacé Cuentas" → mejor para Google News/Discover.
      title: (p.ogTitle || p.title || p.slug).slice(0, 120),
      publicationDate: new Date(t).toISOString(),
      language: 'es',
    });
  }

  // Blog posts PT-BR fresh (motor Discover BR) → /pt/blog/, news:language=pt
  for (const p of (blogPostsPt as any[])) {
    const dateStr = p.updatedDate || p.date;
    if (!dateStr) continue;
    const t = Date.parse(dateStr);
    if (Number.isNaN(t) || now - t > BLOG_WINDOW_MS) continue;
    newsEntries.push({
      loc: `${site}/pt/blog/${p.slug}`,
      title: (p.ogTitle || p.title || p.slug).slice(0, 120),
      publicationDate: new Date(t).toISOString(),
      language: 'pt',
    });
  }

  // Calcs con dataUpdate fresh (BCRA/dolar/inflación refresh diario).
  // Filtro frequency: el news sitemap es para contenido editorialmente news-worthy
  // (data dinámica con refresh real). Calcs con frequency='never' o 'monthly'/'yearly'
  // que vieron lastUpdated bumpeado por un bulk-fix de metadata NO son news.
  // Sin este filtro, un bulk update de 2k+ calcs el mismo día genera 1000 entries
  // con misma publication_date — patrón que Google News penaliza como spam.
  for (const c of (calcs as any[])) {
    const dataDate = c.dataUpdate?.lastUpdated;
    const freq = c.dataUpdate?.frequency;
    if (!dataDate || !/^\d{4}-\d{2}-\d{2}$/.test(dataDate)) continue;
    if (freq !== 'daily' && freq !== 'weekly') continue;
    const t = Date.parse(dataDate + 'T00:00:00Z');
    if (Number.isNaN(t) || now - t > TWO_DAYS_MS) continue;
    newsEntries.push({
      loc: `${site}/${c.slug}`,
      title: (c.h1 || c.title || c.slug).slice(0, 120),
      publicationDate: new Date(t).toISOString(),
      language: 'es',
    });
  }

  // Cap a 1000 entries (Google News limit)
  newsEntries.splice(1000);

  if (newsEntries.length > 0) {
    writeFileSync(join(PUBLIC_DIR, 'sitemap-news.xml'), newsSitemapXml(newsEntries), 'utf8');
    sitemaps.push({
      name: 'sitemap-news.xml',
      urls: [{ loc: `${site}/`, lastmod: buildDate, changefreq: 'hourly', priority: '0.9' }],
      // @ts-expect-error skipWrite — ya escribimos arriba con schema custom
      skipWrite: true,
    });
    console.log(`📰 sitemap-news.xml: ${newsEntries.length} entries fresh (<48h)`);
  } else {
    // Con ventana de 7d esto solo pasa si el motor lleva >7 días sin publicar
    // (anomalía → el motor alerta aparte). NO borramos el archivo: un feed un
    // poco viejo es mejor que un 404 para Discover/News.
    console.log('📰 sitemap-news.xml: 0 entries en 7d — ¿motor sin notas? mantengo el archivo anterior');
  }
}

// 5. Comparaciones, tablas, glosario — mtime del JSON (no del build)
function sitemapForContent(items: any[], dir: string, pathPrefix: string, priority: string): Url[] {
  // Una página que canonicaliza a otra URL no va al sitemap: pedirle a Google/Bing
  // que crawlee algo que después le decimos que no es el original quema crawl budget
  // y manda una señal contradictoria. `canonicalUrl` lo setea el JSON cuando la
  // página queda como contenido de apoyo de otra (ver canonicalReason).
  return items
    .filter((it: any) => !it.canonicalUrl)
    .map((it: any) => {
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

// 7b. Salas de decisión (/decidir/*) — namespace propio, segmento AISLADO.
// ---------------------------------------------------------------------------
// Hubs de decisión (/{silo}/{tema}) — la arquitectura que reemplaza a las
// calculadoras sueltas. Cada hub declara su `slug` y su `lastReviewed`.
//
// Se leen del filesystem con regex en vez de importar el registry, porque el
// registry usa `import.meta.glob` (Vite) y este script corre en tsx puro.
//
// lastmod = lastReviewed editorial, NO buildDate: deployar otra cosa no mueve
// estas URLs (regla #1/#3 de CLAUDE.md, anti-churn del sitemap).
// ---------------------------------------------------------------------------
const LOCALE_DIRS = new Set(['cl','co','do','ec','en','es','mx','pe','pt','pt-pt','py','uy','ve']);
const decisionHubUrls: Url[] = (() => {
  const dir = join(ROOT, 'src', 'lib', 'hubs');
  if (!existsSync(dir)) return [];
  const silos = new Map<string, string>();
  const urls: Url[] = [];
  // Dos niveles: los .ts de la raíz son AR/global y los de `<locale>/` son los
  // hubs de cada mercado (co, mx, en…). El registry usa import.meta.glob, que
  // acá no está disponible, así que caminamos el directorio a mano.
  const files: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      for (const f of readdirSync(join(dir, e.name))) {
        if (f.endsWith('.ts')) files.push(join(e.name, f));
      }
    } else if (e.name.endsWith('.ts')) {
      files.push(e.name);
    }
  }
  for (const f of files) {
    const base = f.split('/').pop()!;
    if (base === 'types.ts' || base === 'registry.ts') continue;
    const raw = readFileSync(join(dir, f), 'utf8');
    // Cortar desde `export const hub`: un hub puede declarar arriba constantes
    // con su propio `slug:` (p. ej. la tabla de calcs que absorbe), y el regex
    // se quedaba con el PRIMERO del archivo. `casamiento.ts` publicaba así
    // /calculadora-costo-boda-argentina —una URL que hoy es 301— y su hub real
    // /eventos/casamiento quedaba fuera del sitemap, invisible para Google.
    const hubStart = raw.indexOf('export const hub');
    if (hubStart < 0) continue;
    const src = raw.slice(hubStart);
    const slug = src.match(/^\s*slug:\s*'([^']+)'/m)?.[1];
    if (!slug || !slug.includes('/')) continue;
    const reviewed = src.match(/^\s*lastReviewed:\s*'([^']+)'/m)?.[1];
    const siloHref = src.match(/^\s*siloHref:\s*'([^']+)'/m)?.[1];
    const lastmod = clampToToday(reviewed || buildDate);
    urls.push({ loc: `${site}/${slug}`, priority: '0.9', changefreq: 'weekly', lastmod });
    if (siloHref) {
      const prev = silos.get(siloHref);
      if (!prev || lastmod > prev) silos.set(siloHref, lastmod);
    }
  }
  // Recorridos institucionales: comparten un único archivo de datos y una
  // plantilla, pero son hubs editoriales canónicos dentro de los silos activos.
  // El snapshot de herramientas se alimenta de este sitemap, así que deben
  // entrar acá aunque no exporten un `hub` individual por archivo.
  const journeysFile = join(ROOT, 'src', 'lib', 'institutional-journeys.ts');
  if (existsSync(journeysFile)) {
    const raw = readFileSync(journeysFile, 'utf8');
    const blocks = raw.split(/\n\s{2}[a-z]+:\s*\{/).slice(1);
    for (const block of blocks) {
      const slug = block.match(/\bslug:\s*'([^']+)'/)?.[1];
      const siloHref = block.match(/\bsiloHref:\s*'([^']+)'/)?.[1];
      if (!slug || !slug.includes('/')) continue;
      const lastmod = '2026-08-03';
      urls.push({ loc: `${site}/${slug}`, priority: '0.9', changefreq: 'weekly', lastmod });
      if (siloHref) {
        const prev = silos.get(siloHref);
        if (!prev || lastmod > prev) silos.set(siloHref, lastmod);
      }
    }
  }
  // Página de silo: lastmod = el hub más fresco que contiene.
  for (const [href, lastmod] of silos) {
    urls.push({ loc: `${site}${href}`, priority: '0.8', changefreq: 'weekly', lastmod });
  }
  // Home de cada mercado (/co, /mx, /en…). Entraban al sitemap por el bloque de
  // calcs de país, que murió con la consolidación en hubs: quedaron fuera pese a
  // ser 200 y ser el destino del breadcrumb de TODOS los hubs de su mercado.
  // El lastmod es el del hub más fresco del mercado, no el buildDate, para no
  // moverlas en cada deploy (regla #3 del proyecto).
  const homes = new Map<string, string>();
  for (const [href, lastmod] of silos) {
    const cc = href.split('/')[1];
    if (!cc || !LOCALE_DIRS.has(cc)) continue;
    const prev = homes.get(cc);
    if (!prev || lastmod > prev) homes.set(cc, lastmod);
  }
  for (const [cc, lastmod] of homes) {
    urls.push({ loc: `${site}/${cc}`, priority: '0.85', changefreq: 'weekly', lastmod });
  }
  return urls;
})();

// Intención decisional (≠ calc transaccional, ≠ guía informacional). El lastmod
// sale de room.lastReviewed (editorial), NO del buildDate, así que deployar otra
// cosa NO mueve estas URLs ni inflar el sitemap de las ~2500 calcs (regla #1/#3).
// Las salas /decidir se dieron de baja el 28-07-2026: cada pregunta que
// respondían la responde hoy un hub de decisión con más calculadoras adentro.
// Las 68 URLs son 301. Ya no hay sitemap-decidir.xml.


// Hubs de decisión (/{silo}/{tema}) + páginas de silo. Sitemap propio para
// poder mirar su indexación por separado en Bing/GSC durante la migración.
if (decisionHubUrls.length > 0) {
  sitemaps.push({ name: 'sitemap-hubs.xml', urls: decisionHubUrls });
}

// 7c. Productos verticales (/mi y /mi/*) — namespace propio, segmento AISLADO.
// Superficies de marca (Mi Plata / Trabajo / Casa / Familia). lastmod editorial
// FIJO (no buildDate) para no inflar el sitemap en cada deploy (regla #1/#3).
if (PRODUCTS.length > 0) {
  const PRODUCTS_REVIEWED = '2026-06-30';
  const miUrls: Url[] = [
    { loc: `${site}/mi`, priority: '0.8', changefreq: 'weekly', lastmod: clampToToday(PRODUCTS_REVIEWED) },
    ...PRODUCTS.map((p) => ({
      loc: `${site}/mi/${p.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: clampToToday(PRODUCTS_REVIEWED),
    })),
  ];
  sitemaps.push({ name: 'sitemap-mi.xml', urls: miUrls });
}

// 8. Argentina provincial — DADO DE BAJA el 28-07-2026.
// Eran 5 calculadoras replicadas en 24 provincias (120 páginas + 24 índices):
// el mismo cálculo con otra tabla provincial. Se absorbieron en los hubs que ya
// cubrían cada tema (patente → /auto/patente, IIBB → /impuestos/ingresos-brutos,
// m² → /construccion/costo-por-m2, sellos → /vivienda/gastos-de-escritura,
// inmobiliario → /impuestos/bienes-personales) y hoy las 144 URLs son 301.
// El contenido de src/content/argentina/ sigue en el repo por si se quiere
// recuperar la tabla provincial dentro de un hub con selector de provincia.

// 8b. Informes (/informes/<slug>) y verticales de partners (/partners/<vertical>).
// Los hubs /informes y /partners ya estaban en core(), pero sus hijos —páginas 200
// indexables generadas desde registries— no estaban en ningún sitemap (audit
// 2026-07-24). Se derivan del MISMO registry que usa getStaticPaths para que no se
// desincronicen cuando alguien agrega un informe o una vertical.
const registryUrls: Url[] = [
  ...INFORME_SLUGS.map((slug) => ({
    loc: `${site}/informes/${slug}`,
    priority: '0.6',
    changefreq: 'monthly',
    lastmod: getLastMod(INFORMES_REGISTRY_PATH, buildDate),
  })),
  ...VERTICALES.map((v: any) => ({
    loc: `${site}/partners/${v.slug}`,
    priority: '0.6',
    changefreq: 'monthly',
    lastmod: getLastMod(join(ROOT, 'src', 'lib', 'partners', 'verticales.ts'), buildDate),
  })),
];
if (registryUrls.length > 0) {
  sitemaps.push({ name: 'sitemap-registries.xml', urls: registryUrls });
}

// --------------------------------------------------------------------------
// IIBB — /iibb/index + /iibb/[provincia] (1 + 24 = 25 páginas).
// Las 240 combinaciones /iibb/[prov]/[actividad] se consolidaron con 301 a la
// página de provincia (2026-07-08): eran fill-in-the-blank puro y el patrón
// doorway fue señalado en la auditoría AdSense. NO volver a generarlas.
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
  }
  sitemaps.push({ name: 'sitemap-iibb.xml', urls: iibbUrls });
}

// --------------------------------------------------------------------------
// Image sitemap — listamos cada calc con su OG png como <image:image>.
// Apunta a Google Images para queries visuales y abre crawl path adicional.
// Solo incluye calcs que tienen un OG generado en public/og/{slug}.png.
// --------------------------------------------------------------------------

interface ImageEntry {
  loc: string;
  image: string;
  caption: string;
  title: string;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function imagesetXml(entries: ImageEntry[]): string {
  // El protocolo permite múltiples <image:image> dentro de una misma <url>.
  // Una calc puede tener OG + infografía; emitir dos bloques <url> con el mismo
  // <loc> agrega duplicados innecesarios y algunos validadores los reportan como
  // URLs repetidas. Agrupamos por página y deduplicamos la imagen dentro de ella.
  const byPage = new Map<string, ImageEntry[]>();
  for (const entry of entries) {
    const pageImages = byPage.get(entry.loc) || [];
    if (!pageImages.some((image) => image.image === entry.image)) {
      pageImages.push(entry);
    }
    byPage.set(entry.loc, pageImages);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...byPage.entries()].map(([loc, images]) => `  <url>
    <loc>${escapeXml(loc)}</loc>
${images.map((e) => `    <image:image>
      <image:loc>${escapeXml(e.image)}</image:loc>
      <image:title>${escapeXml(e.title)}</image:title>
      <image:caption>${escapeXml(e.caption)}</image:caption>
      <image:license>https://creativecommons.org/licenses/by/4.0/</image:license>
    </image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>`;
}

const imageEntries: ImageEntry[] = [];
// Gate de OG contra el manifest (src/lib/og-manifest.json), NO contra existsSync(public/og):
// en prebuild `og` y `sitemap` corren EN PARALELO → el disco está a medio repoblar y el
// existsSync tiraba ~1500 OG (incluidas TODAS las de locales, que ni se intentaban). El
// manifest del build previo es estable y se auto-cura al build siguiente.
let ogSet: Set<string>;
try {
  ogSet = new Set(Object.keys(JSON.parse(readFileSync(join(ROOT, 'src', 'lib', 'og-manifest.json'), 'utf8'))));
} catch {
  ogSet = new Set();
}
// Empuja la OG card (1200×630, una por calc indexada) + la infografía propia (si existe)
// al sitemap de imágenes. Mismo criterio para AR y para cada locale.
function pushImageEntries(loc: string, c: any) {
  // Caption enriquecido: H1 + description + primer keyword secundario.
  // Google/Bing Images premian captions descriptivos (50-150 chars) vs títulos cortos.
  const h1 = (c.h1 || c.title || c.slug).trim();
  const desc = ((c.description || '') as string).trim();
  const primaryKw = ((c.seoKeywords || [])[0] as string | undefined)?.trim() || '';
  const captionParts = [h1];
  if (desc) captionParts.push(desc);
  if (primaryKw && !h1.toLowerCase().includes(primaryKw.toLowerCase())) captionParts.push(primaryKw);
  const caption = captionParts.join(' — ').slice(0, 300);
  if (ogSet.has(c.slug)) {
    imageEntries.push({ loc, image: `${site}/og/${c.slug}.png`, caption, title: h1.slice(0, 100) });
  }
  // Infografía propia (campo `infographic`): imagen rica con datos reales. Vive en /img.
  const info = (c as any).infographic;
  if (info && info.src) {
    imageEntries.push({
      loc,
      image: (info.src as string).startsWith('http') ? info.src : `${site}${info.src}`,
      caption: ((info.caption || info.alt || caption) as string).slice(0, 300),
      title: ((info.alt || h1) as string).slice(0, 100),
    });
  }
}
for (const c of calcs) pushImageEntries(`${site}/${c.slug}`, c);
// Calcs por locale: el loop AR de arriba solo cubre src/content/calcs; las verticales
// (/es, /mx, …) van acá — ahora también con su OG card, no solo la infografía.
for (const [loc, list] of [['es', calcsEs], ['mx', calcsMx], ['cl', calcsCl], ['co', calcsCo], ['pe', calcsPe], ['ec', calcsEc], ['ve', calcsVe], ['py', calcsPy], ['uy', calcsUy], ['do', calcsDo], ['pt-pt', calcsPtPt], ['en', calcsEn], ['pt', calcsPt]] as const) {
  for (const c of list as any[]) pushImageEntries(`${site}/${loc}/${c.slug}`, c);
}
// Excluir del sitemap de imágenes los mismos zombies 301/308 de _redirects.
let imageEntriesClean = imageEntries;
try {
  const redirSrc = new Set<string>();
  for (const line of readFileSync(join(PUBLIC_DIR, '_redirects'), 'utf8').split('\n')) {
    const m = line.trim().match(/^(\/[^\s]+)\s+\S+\s+30[18]\b/);
    if (m && !m[1].includes('*') && !m[1].includes(':')) redirSrc.add(m[1].replace(/\/$/, '') || '/');
  }
  imageEntriesClean = imageEntries.filter((e) => {
    try {
      const path = new URL(e.loc).pathname.replace(/\/$/, '') || '/';
      return !redirSrc.has(path) && !GONE_410_URLS.has(path) && !(path in PRUNING_REDIRECTS);
    } catch { return true; }
  });
} catch { /* no-op */ }
if (imageEntriesClean.length > 0) {
  writeFileSync(join(PUBLIC_DIR, 'sitemap-images.xml'), imagesetXml(imageEntriesClean), 'utf8');
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
// Validar cambios de lastmod antes de escribir
// --------------------------------------------------------------------------
// Pasada final: para cada URL, comparamos el lastmod editorial/de datos contra
// el state previo. La fecha se publica exacta; el tripwire de abajo evita que
// un mass-edit re-estampe de golpe una porción grande del catálogo.

const { state: prevState, source: stateSource } = loadState();
const usedLastmods = new Map<string, string>();
let unchangedCount = 0;
let newCount = 0;
const raisedLocs = new Set<string>();

for (const s of sitemaps) {
  for (const u of s.urls) {
    const prev = prevState.get(u.loc);
    if (prev === undefined) newCount++;
    else if (u.lastmod > prev) raisedLocs.add(u.loc);
    else unchangedCount++;
    // MAX si la URL aparece en >1 sitemap — el state representa el lastmod
    // que Google verá para esa URL (Google también toma el más nuevo).
    const prevUsed = usedLastmods.get(u.loc);
    if (!prevUsed || u.lastmod > prevUsed) usedLastmods.set(u.loc, u.lastmod);
  }
}

if (stateSource !== 'fresh' && raisedLocs.size > MAX_LASTMOD_UPDATES && !ALLOW_MASS_LASTMOD) {
  const sample = [...raisedLocs].slice(0, 12).join('\n  - ');
  throw new Error(
    `[sitemap] abortado: ${raisedLocs.size} URLs existentes subirían lastmod ` +
    `(máximo ${MAX_LASTMOD_UPDATES}). Revisá el cambio masivo o, si es editorial ` +
    `y deliberado, ejecutá con SITEMAP_ALLOW_MASS_LASTMOD=1.\n  - ${sample}`,
  );
}
if (stateSource !== 'fresh' && newCount > MAX_NEW_URLS && !ALLOW_MASS_NEW_URLS) {
  throw new Error(
    `[sitemap] abortado: ${newCount} URLs nuevas entrarían al sitemap ` +
    `(máximo ${MAX_NEW_URLS}). Publicá en lotes editoriales más chicos o, si ` +
    `la tanda fue revisada deliberadamente, ejecutá con SITEMAP_ALLOW_MASS_NEW_URLS=1.`,
  );
}

// --------------------------------------------------------------------------
// Write files
// --------------------------------------------------------------------------

// Filtro defensivo: excluir URLs en GONE_410_URLS de cualquier sitemap. El
// middleware del Worker sirve 410 GONE para esas rutas; listarlas en sitemap
// confunde a Google (le decimos "indexá" y al rato "esto no existe").
// Ya pasó con /en/burnout-mbi-assessment — pruna no removida del sitemap-en.
let gone410Stripped = 0;
for (const s of sitemaps) {
  const before = s.urls.length;
  s.urls = s.urls.filter((u: any) => {
    try {
      const path = new URL(u.loc).pathname.replace(/\/$/, '') || '/';
      return !GONE_410_URLS.has(path);
    } catch { return true; }
  });
  gone410Stripped += before - s.urls.length;
}
if (gone410Stripped > 0) {
  console.log(`Stripped ${gone410Stripped} URLs marcadas como 410 GONE.`);
}

// Segmentos utilitarios: páginas de navegación/producto que no compiten por
// ninguna query. Medición Bing 90d (CSV PageTraffic, 946 URLs con impresiones):
// /decidir/, /comparar/, /partners/, /mi/, /informes/,
// /fin-de-semana/ dieron 0 impresiones en TODOS sus URLs. Siguen vivas y
// linkeadas desde el sitio; sólo salen del sitemap para que el crawl y la señal
// se concentren en lo que puede rankear.
const UTILITY_PREFIXES = [
  '/decidir/', '/comparar/', '/partners/',
  '/mi/', '/informes/', '/fin-de-semana/',
];
let utilityStripped = 0;
for (const s of sitemaps) {
  const before = s.urls.length;
  s.urls = s.urls.filter((u: any) => {
    try {
      const path = new URL(u.loc).pathname;
      return !UTILITY_PREFIXES.some((p) => path === p.slice(0, -1) || path.startsWith(p));
    } catch { return true; }
  });
  utilityStripped += before - s.urls.length;
}
if (utilityStripped > 0) {
  console.log(`Stripped ${utilityStripped} URLs de segmentos utilitarios (0 impresiones Bing 90d).`);
}

// Filtro defensivo: excluir sources de 301/308 declarados en public/_redirects.
// El generador ya excluye canonicalSlug + PRUNING_REDIRECTS + GONE_410, pero NO
// las 301 manuales de _redirects. Un JSON vivo con slug 301eado (zombie) se
// colaba en el sitemap (auditoría bing-growth 2026-07-03: calculadora-plan-
// maraton-semanas-experiencia, calculadora-regla-72-duplicar-dinero).
let redirectSrcStripped = 0;
try {
  const redirectSources = new Set<string>();
  const rtxt = readFileSync(join(PUBLIC_DIR, '_redirects'), 'utf8');
  for (const line of rtxt.split('\n')) {
    const m = line.trim().match(/^(\/[^\s]+)\s+(\S+)\s+30[18]\b/);
    if (m && !m[1].includes('*') && !m[1].includes(':')) {
      const src = m[1].replace(/\/$/, '') || '/';
      // Normalización de trailing slash (`/mx/` → `/mx`): el destino ES la URL
      // canónica. Como acá el source se normaliza sacándole la barra final,
      // `/mx/` colapsa a `/mx` y el filtro terminaba excluyendo del sitemap
      // justo la URL que la redirección canonicaliza. Los 6 hubs de vertical
      // (/mx /co /cl /es /pt /en) quedaban fuera del sitemap —y por lo tanto
      // fuera del push a IndexNow— por esta vía.
      let dstPath = m[2];
      try { dstPath = new URL(dstPath, site).pathname; } catch { /* destino relativo raro */ }
      dstPath = dstPath.replace(/\/$/, '') || '/';
      if (src === dstPath) continue;
      redirectSources.add(src);
    }
  }
  for (const s of sitemaps) {
    const before = s.urls.length;
    s.urls = s.urls.filter((u: any) => {
      try { const path = new URL(u.loc).pathname.replace(/\/$/, '') || '/'; return !redirectSources.has(path); } catch { return true; }
    });
    redirectSrcStripped += before - s.urls.length;
  }
} catch { /* sin _redirects: no-op */ }
if (redirectSrcStripped > 0) {
  console.log(`Stripped ${redirectSrcStripped} URLs con 301/308 en _redirects (zombies JSON-vivo/URL-redirigida).`);
}

// Red de seguridad final: sacar del sitemap TODA URL que el worker sirva como
// 301 o 410. El filtro de arriba sólo mira `public/_redirects`, pero la poda
// vive en PRUNING_REDIRECTS (worker), y varias listas de este script son
// hardcodeadas — así que cada vez que se podaba algo, el sitemap seguía
// mandando a Google URLs que redirigen. Esto lo hace imposible por diseño:
// una URL retirada no puede quedar publicada aunque alguien olvide borrarla
// de su lista.
let prunedStripped = 0;
for (const s of sitemaps) {
  const before = s.urls.length;
  s.urls = s.urls.filter((u: any) => {
    let path: string;
    try { path = new URL(u.loc).pathname.replace(/\/$/, '') || '/'; } catch { return true; }
    return !(PRUNING_REDIRECTS as Record<string, unknown>)[path] && !GONE_410_URLS.has(path);
  });
  prunedStripped += before - s.urls.length;
}
if (prunedStripped > 0) {
  console.log(`Stripped ${prunedStripped} URLs podadas (301/410 del worker) que alguna lista seguía publicando.`);
}

let totalUrls = 0;
// Si una categoría o un locale queda con cero URLs distribuibles, ya no entra
// en `sitemaps`. Eliminamos el XML de builds anteriores para que Cloudflare no
// siga sirviendo URLs que hoy son noindex/restringidas.
// Sólo los que realmente se escriben: un sitemap que quedó en 0 URLs no se
// escribe, así que su archivo viejo tiene que salir del disco.
const generatedNames = new Set(sitemaps.filter((s) => s.urls.length > 0 || (s as any).skipWrite).map((s) => s.name));
const localeSitemapRe = /^sitemap-(?:en|pt|pt-pt|mx|es|co|cl|pe|ec|ve|py|uy|do)\.xml$/;
for (const name of safeReadDir(PUBLIC_DIR)) {
  if (name === 'sitemap.xml') continue;
  // Antes sólo se limpiaban los sitemaps de calcs y de locale, así que los de
  // secciones dadas de baja quedaban huérfanos en disco: Cloudflare los seguía
  // sirviendo con URLs muertas (sitemap-glosario.xml publicaba 48 páginas que
  // hoy son 404, y sitemap-decidir.xml quedó en 0). Ahora se borra cualquier
  // sitemap-*.xml que este build no haya generado.
  if (/^sitemap-[a-z0-9-]+\.xml$/i.test(name) && !generatedNames.has(name)) {
    unlinkSync(join(PUBLIC_DIR, name));
  }
}
for (const s of sitemaps) {
  // sitemap-images.xml lo escribimos arriba con imagesetXml (schema distinto).
  if ((s as any).skipWrite) continue;
  // No escribir sitemaps vacíos: quedaban en disco con 0 URLs y Cloudflare los
  // servía igual. El índice ya no los lista (ver `indexableSitemaps`).
  if (s.urls.length === 0) continue;
  writeFileSync(join(PUBLIC_DIR, s.name), urlsetXml(s.urls), 'utf8');
  totalUrls += s.urls.length;
}
totalUrls += imageEntriesClean.length;

// Index principal. sitemap-priority.xml también entra: además de ser la cohorte
// de recrawl para Bing/IndexNow, contiene landings editoriales que no pertenecen
// a los sitemaps de calcs/core. Los solapamientos entre sitemaps son válidos en
// el protocolo y los consumidores internos deduplican por URL.
// Un sitemap vacío en el índice es ruido: el rastreador lo pide y no encuentra
// nada. Pasaba con sitemap-{comparaciones,decidir,mi,registries}.xml, que
// quedaron en 0 URLs cuando su contenido se consolidó o salió del sitemap a
// propósito (p. ej. /decidir/*, que sigue vivo pero no compite por queries).
const indexableSitemaps = sitemaps.filter((s) => s.urls.length > 0 || (s as any).skipWrite);
const indexEntries = indexableSitemaps.map((s) => {
  const loc = `${site}/${s.name}`;
  const desired = maxLastmod(s.urls, buildDate);
  const prevUsed = usedLastmods.get(loc);
  if (!prevUsed || desired > prevUsed) usedLastmods.set(loc, desired);
  return { loc, lastmod: desired };
});
const indexContent = indexXml(indexEntries);
writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), indexContent, 'utf8');

saveState(usedLastmods);

console.log(`✓ sitemap index → ${indexableSitemaps.length} sitemaps, ${totalUrls} URLs generadas`);
console.log(`  sitemap tripwire: maxLastmod=${MAX_LASTMOD_UPDATES} · maxNew=${MAX_NEW_URLS} · state=${stateSource} · new=${newCount} · raised=${raisedLocs.size} · unchanged=${unchangedCount}`);
for (const s of sitemaps) {
  console.log(`  · ${s.name.padEnd(40)} ${String(s.urls.length).padStart(5)} URLs`);
}
