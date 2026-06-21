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
import { GONE_410_URLS } from '../src/lib/gone-410.ts';
import { PRUNING_REDIRECTS } from '../src/lib/pruning-redirects.ts';

const PRUNED_SLUGS = new Set(Object.keys(PRUNING_REDIRECTS).map((p) => p.replace(/^\//, '')));

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CALCS_DIR = join(ROOT, 'src', 'content', 'calcs');
const CALCS_EN_DIR = join(ROOT, 'src', 'content', 'calcs-en');
const CALCS_PT_DIR = join(ROOT, 'src', 'content', 'calcs-pt');
const CALCS_MX_DIR = join(ROOT, 'src', 'content', 'calcs-mx');
const CALCS_ES_DIR = join(ROOT, 'src', 'content', 'calcs-es');
const CALCS_CO_DIR = join(ROOT, 'src', 'content', 'calcs-co');
const CALCS_CL_DIR = join(ROOT, 'src', 'content', 'calcs-cl');
const CALCS_PE_DIR = join(ROOT, 'src', 'content', 'calcs-pe');
const CALCS_EC_DIR = join(ROOT, 'src', 'content', 'calcs-ec');
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
    .filter((d: any) => !d.noindex)
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
  const lr = pickIfValid(calc?.lastReviewed);
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
// Rollout cap — limita cuánto puede subir el lastmod de una URL entre deploys.
//
// Por qué: cualquier mejora a la lógica de lastmod (max() del bug fix, nueva
// señal de frescura, fetcher que toca N calcs) puede generar un spike donde
// cientos/miles de URLs ven su lastmod cambiar el mismo día. Eso es un patrón
// que Google asocia con sitemaps sucios (mass-bump fake).
//
// El cap distribuye el ajuste en el tiempo: si una URL "merece" un lastmod
// 14 días más nuevo del que reportamos antes, le damos +7 hoy y +7 al próximo
// deploy. Estabiliza naturalmente cuando todas las URLs llegan a su "desired".
//
// State persistido en db/sitemap-state.json. Si no existe, hacemos bootstrap
// leyendo los XMLs actuales en public/ (transición sin spike). Si tampoco
// existen (clean repo), usamos desired sin cap (no hay qué romper).
//
// Cap configurable via env: SITEMAP_LASTMOD_CAP_DAYS (default 7).
//   - cap=0 desactiva el sistema (siempre usa desired, riesgo de spike).
//   - cap=∞ equivalente con valor muy alto.
// --------------------------------------------------------------------------

const STATE_FILE = join(ROOT, 'db', 'sitemap-state.json');
const CAP_DAYS = (() => {
  const raw = process.env.SITEMAP_LASTMOD_CAP_DAYS;
  if (!raw) return 7;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 7;
})();

interface SitemapState {
  // ISO timestamp del último guardado. Usado para calcular el cap efectivo:
  // si pasaron < 24h entre builds, el cap se reduce proporcionalmente para
  // que 10 deploys el mismo día no sumen 10*CAP_DAYS.
  savedAt: string;
  // URL → lastmod reportado en el sitemap previo. Se actualiza tras cada build.
  lastmods: Record<string, string>;
}

let prevSavedAt: Date | null = null;

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
      if (raw.savedAt) prevSavedAt = new Date(raw.savedAt);
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

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Cap el lastmod desired contra el previamente reportado. Solo limita SUBIDAS
 * (URLs que aparecen como más nuevas de lo que dijimos antes). Si baja o no
 * había previo, se respeta desired.
 *
 * El cap efectivo se escala según el tiempo real desde el último build: si
 * pasaron 24h, cap = CAP_DAYS; si pasaron 6h, cap = CAP_DAYS * 0.25; con esto
 * 10 deploys el mismo día no suman 10*CAP_DAYS al lastmod de cada URL.
 */
function effectiveCapDays(): number {
  if (CAP_DAYS === 0) return 0;
  if (!prevSavedAt) return CAP_DAYS;
  const hoursSince = (Date.now() - prevSavedAt.getTime()) / (1000 * 60 * 60);
  if (hoursSince >= 24) return CAP_DAYS;
  if (hoursSince <= 0) return 0;
  // Cap proporcional. Mínimo 0 días (no movimiento) si pasaron < 1h.
  const scaled = Math.floor(CAP_DAYS * (hoursSince / 24));
  return Math.max(0, scaled);
}

function capLastmod(prev: string | undefined, desired: string): string {
  const cap = effectiveCapDays();
  if (cap === 0) return prev && desired > prev ? prev : desired;
  if (!prev || desired <= prev) return desired;
  const ceiling = addDays(prev, cap);
  return desired > ceiling ? ceiling : desired;
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
const calcsMx = readJSONs(CALCS_MX_DIR, 'mx');
const calcsEs = readJSONs(CALCS_ES_DIR, 'es');
const calcsCo = readJSONs(CALCS_CO_DIR, 'co');
const calcsCl = readJSONs(CALCS_CL_DIR, 'cl');
const calcsPe = readJSONs(CALCS_PE_DIR, 'pe');
const calcsEc = readJSONs(CALCS_EC_DIR, 'ec');
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
  prio('/calculadora-cientifica',            '0.9',  'weekly'),
  prio('/valores-bcra',                      '0.9',  'daily',  true),
  prio('/dolar-hoy',                         '0.95', 'daily',  true),
  prio('/dolar-hoy-chile',                   '0.9',  'daily',  true),
  prio('/dolar-hoy-colombia',                '0.9',  'daily',  true),
  prio('/dolar-hoy-mexico',                  '0.9',  'daily',  true),
  prio('/dolar-hoy-peru',                    '0.9',  'daily',  true),
  prio('/precio-nafta-hoy',                  '0.9',  'weekly', true),
  prio('/fixture-mundial-2026',              '0.95', 'daily',  true),
  prio('/partidos-hoy-mundial-2026',         '0.95', 'daily',  true),
  // Landings de feriados LATAM 2026 (evergreen del año, alta intención)
  prio('/feriados-mexico-2026',              '0.85', 'weekly'),
  prio('/feriados-colombia-2026',            '0.85', 'weekly'),
  prio('/feriados-chile-2026',               '0.85', 'weekly'),
  prio('/feriados-peru-2026',                '0.85', 'weekly'),
  prio('/feriados-ecuador-2026',             '0.85', 'weekly'),
  // Web Stories (AMP) — Google les da carrusel propio en Discover/Imágenes
  prio('/historias/vacaciones-invierno-2026',            '0.7', 'weekly'),
  prio('/historias/aguinaldo-2026-plazo-fijo-dolar-uva', '0.7', 'weekly'),
  prio('/historias/calefaccion-invierno-2026',           '0.7', 'weekly'),
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
  prio('/guia/sueldos-impuestos-peru-2026',  '0.9',  'weekly'),
  prio('/guia/sueldos-impuestos-ecuador-2026', '0.9', 'weekly'),
];
// Top categorías (las más grandes) — estable salvo deploys del template de categoría
for (const cat of ['finanzas', 'vida', 'salud', 'educacion', 'mascotas', 'matematica', 'cocina', 'deportes', 'tecnologia', 'viajes', 'construccion', 'marketing', 'negocios', 'ciencia', 'automotor', 'familia', 'idiomas', 'jardineria', 'electronica', 'entretenimiento']) {
  priorityUrls.push(prio(`/categoria/${cat}`, '0.85', 'weekly'));
}
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
  'calculadora-tiempo-lectura-libro-paginas',
  'calculadora-costo-m2-construccion-argentina',
  'calculadora-conversor-mb-a-gb',
  'calculadora-palabras-paginas-conversor',
  'calculadora-combustible-viaje-auto',
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
];
const calcBySlug = new Map((calcs as any[]).map((c: any) => [c.slug, c]));
const seenInPriority = new Set<string>(topPrioritySlugs);
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
  .filter((c) => !c.noindex && !seenInPriority.has(c.slug))
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
  lastmod: dynamic ? buildDate : getPageLastMod(path, buildDate),
});
sitemaps.push({
  name: 'sitemap-core.xml',
  urls: [
    core('/',                                    '1.0',  'daily',   true),
    core('/calculadoras',                        '0.9',  'weekly'),
    core('/populares',                           '0.85', 'weekly'),
    core('/comparador-plazo-fijo',               '0.85', 'daily',   true),
    core('/calculadora-cientifica',              '0.85', 'weekly'),
    core('/valores-bcra',                        '0.85', 'daily',   true),
    core('/cambio-de-monedas',                   '0.95', 'hourly',  true),
    core('/cotizacion-cripto',                   '0.95', 'hourly',  true),
    core('/inflacion-argentina',                 '0.9',  'daily',   true),
    core('/presupuesto-familiar',                '0.95', 'weekly'),
    core('/simulador-jubilacion-anses',          '0.95', 'weekly'),
    core('/tracker-embarazo-semana-a-semana',    '0.95', 'weekly'),
    core('/cuanto-falta-para-Navidad-2026',      '0.9',  'daily',   true),
    core('/fixture-mundial-2026',                '0.9',  'daily',   true),
    core('/partidos-hoy-mundial-2026',           '0.92', 'daily',   true),
    core('/posiciones-mundial-2026',             '0.9',  'daily',   true),
    core('/goleadores-mundial-2026',             '0.85', 'daily',   true),
    core('/cuando-juega-argentina-mundial-2026', '0.9',  'daily',   true),
    core('/llave-mundial-2026',                  '0.85', 'daily',   true),
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
    core('/global',                              '0.9',  'weekly',  true),
    core('/es',                                  '0.85', 'weekly',  true),
    core('/es/calculadoras',                     '0.85', 'weekly',  true),
    core('/es/datos-cuota-autonomos-2026',       '0.8',  'monthly', true),
    core('/cl/calculadoras',                     '0.85', 'weekly',  true),
    core('/cl/datos-sueldo-chile-2026',          '0.8',  'monthly', true),
    core('/co/calculadoras',                     '0.85', 'weekly',  true),
    core('/co/datos-salario-minimo-colombia-2026','0.8', 'monthly', true),
    core('/mx/calculadoras',                     '0.85', 'weekly',  true),
    core('/mx/datos-salario-minimo-mexico-2026', '0.8',  'monthly', true),
    core('/pe/calculadoras',                     '0.85', 'weekly',  true),
    core('/pe/datos-sueldo-minimo-peru-2026',    '0.8',  'monthly', true),
    core('/ec/calculadoras',                     '0.85', 'weekly',  true),
    core('/mx',                                  '0.85', 'weekly',  true),
    core('/co',                                  '0.8',  'weekly'),
    core('/cl',                                  '0.8',  'weekly'),
    core('/embeber',                             '0.6',  'monthly'),
    core('/wordpress',                           '0.75', 'weekly'),
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
    core('/datasets',                            '0.6',  'monthly'),
    core('/datos-monotributo-2026',              '0.7',  'monthly'),
    core('/datos-ganancias-2026',                '0.7',  'monthly'),
    core('/datos-topes-sipa-2026',               '0.7',  'monthly'),
    core('/datos-aguinaldo-2026',                '0.7',  'monthly'),
    core('/datos-salario-minimo-latam-2026',     '0.7',  'monthly'),
    core('/pt/dados-inss-irrf-2026',             '0.7',  'monthly'),
    core('/pt/dados-ipca-brasil-historico',      '0.7',  'monthly'),
    core('/datos-bienes-personales-2026',        '0.7',  'monthly'),
    core('/pt/dados-salario-minimo-brasil-2026', '0.7',  'monthly'),
    core('/datos-salario-basico-ecuador-2026',   '0.7',  'monthly'),
    core('/feriados-mexico-2026',                '0.8',  'weekly'),
    core('/feriados-colombia-2026',              '0.8',  'weekly'),
    core('/feriados-chile-2026',                 '0.8',  'weekly'),
    core('/feriados-peru-2026',                  '0.8',  'weekly'),
    core('/feriados-ecuador-2026',               '0.8',  'weekly'),
    core('/dolar-hoy-chile',                     '0.85', 'daily',   true),
    core('/dolar-hoy-colombia',                  '0.85', 'daily',   true),
    core('/dolar-hoy-mexico',                    '0.85', 'daily',   true),
    core('/dolar-hoy-peru',                      '0.85', 'daily',   true),
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
  sitemaps.push({ name: `sitemap-calcs-${cat}.xml`, urls: [catUrl, ...pagerUrls, ...calcUrls] });
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

if (calcsEn.length > 0) sitemaps.push(sitemapForLocale(calcsEn, 'en', CALCS_EN_DIR, false));
if (calcsPt.length > 0) sitemaps.push(sitemapForLocale(calcsPt, 'pt', CALCS_PT_DIR, true));
if (calcsMx.length > 0) sitemaps.push(sitemapForLocale(calcsMx, 'mx', CALCS_MX_DIR, true));
if (calcsEs.length > 0) sitemaps.push(sitemapForLocale(calcsEs, 'es', CALCS_ES_DIR, true));
if (calcsCo.length > 0) sitemaps.push(sitemapForLocale(calcsCo, 'co', CALCS_CO_DIR, true));
if (calcsCl.length > 0) sitemaps.push(sitemapForLocale(calcsCl, 'cl', CALCS_CL_DIR, true));
if (calcsPe.length > 0) sitemaps.push(sitemapForLocale(calcsPe, 'pe', CALCS_PE_DIR, true));
if (calcsEc.length > 0) sitemaps.push(sitemapForLocale(calcsEc, 'ec', CALCS_EC_DIR, true));

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
  const newsEntries: NewsEntry[] = [];

  // Blog posts fresh
  for (const p of (blogPosts as any[])) {
    const dateStr = p.updatedDate || p.date;
    if (!dateStr) continue;
    const t = Date.parse(dateStr);
    if (Number.isNaN(t) || now - t > TWO_DAYS_MS) continue;
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
    if (Number.isNaN(t) || now - t > TWO_DAYS_MS) continue;
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
    // Si no hay entries fresh, borramos el archivo viejo. Sin esto el sitemap-news.xml
    // de la corrida anterior queda servido — engines siguen leyendo data stale.
    const newsPath = join(PUBLIC_DIR, 'sitemap-news.xml');
    if (existsSync(newsPath)) {
      execSync(`rm -f "${newsPath}"`);
      console.log('📰 sitemap-news.xml: 0 entries fresh — removed stale file');
    } else {
      console.log('📰 sitemap-news.xml: 0 entries fresh — skipping');
    }
  }
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
// Hubs por provincia (/argentina/{provincia}) — páginas índice 200 que faltaban
// en el sitemap (Google las marcaba "rastreada sin indexar" por no estar listadas).
for (const p of provincias) {
  argUrls.push({
    loc: `${site}/argentina/${p.slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: buildDate,
  });
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
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map((e) => `  <url>
    <loc>${e.loc}</loc>
    <image:image>
      <image:loc>${e.image}</image:loc>
      <image:title>${escapeXml(e.title)}</image:title>
      <image:caption>${escapeXml(e.caption)}</image:caption>
      <image:license>https://creativecommons.org/licenses/by/4.0/</image:license>
    </image:image>
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
for (const [loc, list] of [['es', calcsEs], ['mx', calcsMx], ['cl', calcsCl], ['co', calcsCo], ['pe', calcsPe], ['ec', calcsEc], ['en', calcsEn], ['pt', calcsPt]] as const) {
  for (const c of list as any[]) pushImageEntries(`${site}/${loc}/${c.slug}`, c);
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
// Apply rollout cap antes de escribir
// --------------------------------------------------------------------------
// Pasada final: para cada URL, comparamos el lastmod desired contra el state
// previo y limitamos la subida a CAP_DAYS. URLs nuevas o que bajan se respetan.
// El state se persiste en db/sitemap-state.json para el próximo build.

const { state: prevState, source: stateSource } = loadState();
const usedLastmods = new Map<string, string>();
let cappedCount = 0;
let unchangedCount = 0;
let raisedCount = 0;
let newCount = 0;

for (const s of sitemaps) {
  for (const u of s.urls) {
    const prev = prevState.get(u.loc);
    const capped = capLastmod(prev, u.lastmod);
    if (prev === undefined) newCount++;
    else if (capped < u.lastmod) cappedCount++;
    else if (capped > prev) raisedCount++;
    else unchangedCount++;
    u.lastmod = capped;
    // MAX si la URL aparece en >1 sitemap — el state representa el lastmod
    // que Google verá para esa URL (Google también toma el más nuevo).
    const prevUsed = usedLastmods.get(u.loc);
    if (!prevUsed || capped > prevUsed) usedLastmods.set(u.loc, capped);
  }
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

let totalUrls = 0;
for (const s of sitemaps) {
  // sitemap-images.xml lo escribimos arriba con imagesetXml (schema distinto).
  if ((s as any).skipWrite) continue;
  writeFileSync(join(PUBLIC_DIR, s.name), urlsetXml(s.urls), 'utf8');
  totalUrls += s.urls.length;
}
totalUrls += imageEntries.length;

// Index principal. El lastmod de cada entry del index es el máximo de las URLs
// adentro de ese sitemap (post-cap), también capeado contra el state previo —
// el index entry tampoco debe saltar > CAP_DAYS porque Google también puede
// asociar ese cambio con un sitemap "sospechoso".
const indexEntries = sitemaps.map((s) => {
  const loc = `${site}/${s.name}`;
  const desired = maxLastmod(s.urls, buildDate);
  const capped = capLastmod(prevState.get(loc), desired);
  const prevUsed = usedLastmods.get(loc);
  if (!prevUsed || capped > prevUsed) usedLastmods.set(loc, capped);
  return { loc, lastmod: capped };
});
const indexContent = indexXml(indexEntries);
writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), indexContent, 'utf8');

saveState(usedLastmods);

console.log(`✓ sitemap index → ${sitemaps.length} sitemaps, ${totalUrls} URLs totales`);
console.log(`  rollout cap: cap=${CAP_DAYS}d (efectivo=${effectiveCapDays()}d) · state=${stateSource} · new=${newCount} · raised=${raisedCount} · capped=${cappedCount} · unchanged=${unchangedCount}`);
for (const s of sitemaps) {
  console.log(`  · ${s.name.padEnd(40)} ${String(s.urls.length).padStart(5)} URLs`);
}
