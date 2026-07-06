/**
 * seo-audit.ts — Auditoría SEO de todas las URLs públicas indexables.
 *
 * Recorre el HTML prerenderizado en dist/client (build local) y genera
 * reports/seo-audit.csv con una fila por URL. Las URLs que están en el
 * sitemap pero no tienen HTML local (rutas SSR) se fetchean de producción,
 * salvo que se pase --offline.
 *
 * Uso:
 *   npm run seo:audit              # audit completo (con fetch SSR + check http duplicado en prioritarias)
 *   npm run seo:audit -- --offline # solo dist local, sin red
 *
 * Salidas:
 *   reports/seo-audit.csv
 *   reports/seo-audit-errors.json
 *
 * Requiere: npm run build previo (usa dist/client).
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist', 'client');
const REPORTS = join(ROOT, 'reports');
const ORIGIN = 'https://hacecuentas.com';
const OFFLINE = process.argv.includes('--offline');

if (!existsSync(DIST)) {
  console.error('✗ No existe dist/client — corré `npm run build` primero.');
  process.exit(1);
}
mkdirSync(REPORTS, { recursive: true });

// ───────────────────────── URLs prioritarias (GSC julio 2026) ─────────────────────────
// Cluster de oportunidad detectado en GSC: posición 8-13, impresiones reales, CTR bajo.
// Lista compartida con seo-render-check.ts y seo-structured-data.ts.
import { PRIORITY_PATHS, GSC_ALIAS_301 } from './seo-priority-urls.ts';
const PRIORITY_URLS = new Set(PRIORITY_PATHS);

// Categorías YMYL: si no tienen fuentes, action_required = missing_sources
const YMYL_CLUSTERS = new Set([
  'salud', 'finanzas', 'impuestos', 'construccion', 'automotor', 'familia',
]);
const YMYL_URL_HINTS = /sueldo|salario|jubilaci|anses|indemnizacion|despido|ganancias|monotributo|impuesto|prestamo|credito|hipotec|embarazo|calorias|imc|dosis|aguinaldo|iibb|afip|arca|alquiler|ley/;

// ───────────────────────── Helpers HTML ─────────────────────────

function extract(re: RegExp, html: string): string {
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<template[\s\S]*?<\/template>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOPWORDS = new Set(['de', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'del', 'un', 'una', 'para', 'con', 'por', 'que', 'como', 'tu', 'te', 'se', 'al', 'o', 'es', 'calculadora', 'conversor', 'online', 'gratis', '2025', '2026', 'the', 'of', 'to', 'and', 'calculator']);

function keywords(s: string): Set<string> {
  return new Set(
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9ñ\s]/g, ' ').split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

function overlap(a: string, b: string): number {
  const ka = keywords(a); const kb = keywords(b);
  if (!ka.size || !kb.size) return 0;
  let n = 0;
  for (const w of ka) if (kb.has(w)) n++;
  return n;
}

// ───────────────────────── Sitemaps → set de URLs + cluster ─────────────────────────

const sitemapUrls = new Map<string, string>(); // url path -> sitemap file (cluster hint)
for (const f of readdirSync(DIST)) {
  if (!/^sitemap-.*\.xml$/.test(f) || f === 'sitemap-images.xml') continue;
  const xml = readFileSync(join(DIST, f), 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    try {
      const u = new URL(m[1]);
      if (!sitemapUrls.has(u.pathname)) sitemapUrls.set(u.pathname, f);
    } catch { /* loc inválido: lo reporta el propio validador de sitemap */ }
  }
}

function clusterOf(path: string, sitemapFile: string | undefined): string {
  if (sitemapFile) {
    const m = sitemapFile.match(/^sitemap-calcs-([a-z-]+)\.xml$/);
    if (m) return m[1];
    return sitemapFile.replace(/^sitemap-/, '').replace(/\.xml$/, '');
  }
  const seg = path.split('/')[1] || 'root';
  return seg === '' ? 'root' : seg;
}

// ───────────────────────── Descubrir URLs desde dist ─────────────────────────

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (['_astro', 'api', 'img', 'blog-img', 'cat-img', 'datasets', 'embed'].includes(name) && dir === DIST) continue;
      walk(p, out);
    } else if (name.endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

function pathToUrl(file: string): string {
  let rel = '/' + relative(DIST, file).replace(/\\/g, '/');
  rel = rel.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (rel !== '/' && rel.endsWith('/')) rel = rel.slice(0, -1);
  return rel === '' ? '/' : rel;
}

const EXCLUDE_URL = /^\/(404|admin|embed|historias-amp|api|offline)(\/|$)/;

const htmlFiles = walk(DIST).filter((f) => !EXCLUDE_URL.test(pathToUrl(f)));
const localUrls = new Map<string, string>(); // url -> file
for (const f of htmlFiles) localUrls.set(pathToUrl(f), f);

// URLs en sitemap sin HTML local = rutas SSR → fetch de producción
const ssrUrls = [...sitemapUrls.keys()].filter((p) => !localUrls.has(p) && !EXCLUDE_URL.test(p));

// ───────────────────────── Análisis por página ─────────────────────────

interface Row { [k: string]: string | number | boolean }
const rows: Row[] = [];
const errors: { url: string; error: string }[] = [];
const titleCount = new Map<string, number>();
const descCount = new Map<string, number>();

function analyze(url: string, html: string, statusCode: number): Row {
  const head = html.slice(0, html.indexOf('</head>') + 7) || html;
  const title = extract(/<title[^>]*>([\s\S]*?)<\/title>/i, head).replace(/\s+/g, ' ');
  const metaDesc = extract(/<meta\s+name="description"\s+content="([^"]*)"/i, head);
  const canonical = extract(/<link\s+rel="canonical"\s+href="([^"]+)"/i, head);
  const robotsMeta = extract(/<meta\s+name="robots"\s+content="([^"]*)"/i, head);

  const canonicalIsSelf = canonical === `${ORIGIN}${url === '/' ? '/' : url}` || canonical === `${ORIGIN}${url}`;
  const noindex = /noindex/i.test(robotsMeta);

  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1]));
  const h1 = h1s[0] || '';

  // Contenido principal: <main> si existe, si no el body completo
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
  const mainHtml = mainMatch ? mainMatch[0] : html;
  const visibleText = stripTags(mainHtml);
  const wordCount = visibleText ? visibleText.split(/\s+/).length : 0;

  // Secciones (marcadores reales del template v2 de calcs)
  const hasFormula = /C[oó]mo se calcula|F[oó]rmula|id="formula|class="formula/i.test(mainHtml) || /como-se-calcula/i.test(mainHtml);
  const hasExample = /id="ejemplo"|Ejemplo (real|paso a paso|pr[aá]ctico)|Casos resueltos|Caso 1:/i.test(mainHtml);
  const hasFaq = /id="(v2-)?faq"|Preguntas frecuentes/i.test(mainHtml);
  const hasSources = /id="(v2-)?fuentes"|Fuentes y referencias|Fuentes oficiales|Fuentes y metodolog/i.test(mainHtml);
  const hasLastUpdated = /[UÚ]ltima revisi[oó]n|Actualizado el|dateModified/i.test(html);
  const hasEditor = /reviewer-block|Revisi[oó]n editorial|Equipo editorial|Editor responsable/i.test(html);

  // Schema
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
  const hasBreadcrumbSchema = /"BreadcrumbList"/.test(ld);
  const hasWebAppSchema = /"(WebApplication|SoftwareApplication)"/.test(ld);
  const hasFaqSchema = /"FAQPage"/.test(ld);

  // Links internos (href relativo o absoluto al dominio) dentro de <main>
  const internalLinks = [...mainHtml.matchAll(/<a[^>]+href="(\/[^"#?]*|https:\/\/hacecuentas\.com\/[^"#?]*)"/g)].length;
  // Related: bloque real primero (related-grid / id="related"); el texto plano
  // también matchea secciones markdown del explanation (falso positivo).
  const relBlockIdx = html.search(/class="related-grid"|id="related"/i);
  const relIdx = relBlockIdx >= 0 ? relBlockIdx : html.search(/Calculadoras relacionadas/i);
  let relatedCount = 0;
  if (relIdx >= 0) {
    const relChunk = html.slice(relIdx, relIdx + 12000);
    relatedCount = [...relChunk.matchAll(/<a[^>]+href="\/[^"#?]*"/g)].length;
  }

  const sitemapFile = sitemapUrls.get(url);
  const cluster = clusterOf(url, sitemapFile);
  const isPriority = PRIORITY_URLS.has(url);
  const isHub = /^\/(categoria|guia|guias|blog|decidir|fin-de-semana|mi|comparar|datos)(\/|$)/.test(url);
  const isCalc = !isHub && (sitemapFile ? /^sitemap-calcs-/.test(sitemapFile) : /^\/(calculadora|conversor|simulador)/.test(url));

  const actions: string[] = [];
  if (!canonicalIsSelf) {
    // canonicalSlug deliberado (apunta a otra página del sitio) ≠ canonical roto
    const deliberate = /^https:\/\/hacecuentas\.com\//.test(canonical);
    if (deliberate) actions.push('canonical_consolidation');
    else if (!noindex) actions.push('canonical_fix');
  }
  // duplicados se marcan en el post-paso (necesitan el conteo global)
  if (wordCount < 600 && isPriority) actions.push('thin_content');
  const ymyl = YMYL_CLUSTERS.has(cluster) || YMYL_URL_HINTS.test(url);
  if (!hasSources && ymyl && isCalc) actions.push('missing_sources');
  if (relatedCount === 0 && isCalc) actions.push('weak_internal_links');

  titleCount.set(title, (titleCount.get(title) || 0) + 1);
  if (metaDesc) descCount.set(metaDesc, (descCount.get(metaDesc) || 0) + 1);

  return {
    url: `${ORIGIN}${url}`,
    status_code: statusCode,
    canonical,
    canonical_is_self: canonicalIsSelf,
    protocol: canonical.startsWith('https://') ? 'https' : (canonical.startsWith('http://') ? 'http' : ''),
    has_http_duplicate: '', // se completa con el check live (solo prioritarias)
    indexable: !noindex && canonicalIsSelf,
    robots_meta: robotsMeta,
    title,
    title_length: title.length,
    title_is_unique: true, // post-paso
    meta_description: metaDesc,
    meta_description_length: metaDesc.length,
    meta_description_is_unique: true, // post-paso
    h1,
    h1_count: h1s.length,
    h1_matches_intent: overlap(h1, title) >= 1,
    word_count_visible: wordCount,
    has_formula_section: hasFormula,
    has_example_section: hasExample,
    has_faq_section: hasFaq,
    has_sources_section: hasSources,
    has_last_updated: hasLastUpdated,
    has_editor: hasEditor,
    has_breadcrumb_schema: hasBreadcrumbSchema,
    has_webapp_or_software_schema: hasWebAppSchema,
    has_faq_schema: hasFaqSchema,
    internal_links_count: internalLinks,
    related_calculators_count: relatedCount,
    sitemap_included: sitemapUrls.has(url),
    priority_cluster: isPriority ? `PRIORITY:${cluster}` : cluster,
    action_required: actions.join('|'),
  };
}

// ───────────────────────── Main ─────────────────────────

console.log(`Auditando ${localUrls.size} URLs locales + ${ssrUrls.length} SSR (sitemap sin HTML local)${OFFLINE ? ' [--offline: SSR omitidas]' : ''}…`);

for (const [url, file] of localUrls) {
  try {
    rows.push(analyze(url, readFileSync(file, 'utf8'), 200));
  } catch (e) {
    errors.push({ url, error: String(e) });
  }
}

async function fetchWithLimit<T>(items: string[], limit: number, fn: (u: string) => Promise<T>): Promise<void> {
  const queue = [...items];
  const workers = Array.from({ length: limit }, async () => {
    while (queue.length) {
      const u = queue.shift()!;
      await fn(u).catch((e) => errors.push({ url: u, error: String(e) }));
    }
  });
  await Promise.all(workers);
}

if (!OFFLINE && ssrUrls.length) {
  await fetchWithLimit(ssrUrls, 8, async (url) => {
    const res = await fetch(`${ORIGIN}${url}`, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
    if (res.status === 200) {
      rows.push(analyze(url, await res.text(), 200));
    } else {
      rows.push({ url: `${ORIGIN}${url}`, status_code: res.status, action_required: res.status >= 300 && res.status < 400 ? 'sitemap_lists_redirect' : 'sitemap_lists_error', canonical: res.headers.get('location') || '', sitemap_included: true, priority_cluster: clusterOf(url, sitemapUrls.get(url)) } as Row);
    }
  });
}

// Check de duplicado HTTP (solo prioritarias — verifica que http:// dé 301 a https://)
if (!OFFLINE) {
  const toCheck = rows.filter((r) => PRIORITY_URLS.has(String(r.url).replace(ORIGIN, '')));
  await fetchWithLimit(toCheck.map((r) => String(r.url)), 6, async (httpsUrl) => {
    const httpUrl = httpsUrl.replace('https://', 'http://');
    const res = await fetch(httpUrl, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    const row = rows.find((r) => r.url === httpsUrl)!;
    const loc = res.headers.get('location') || '';
    const ok301 = (res.status === 301 || res.status === 308) && loc.startsWith('https://hacecuentas.com');
    row.has_http_duplicate = !ok301;
    if (!ok301) row.action_required = [row.action_required, 'http_not_301'].filter(Boolean).join('|');
  });

  // Aliases que GSC reportó con impresiones: deben responder 301 a su canonical.
  for (const [alias, target] of Object.entries(GSC_ALIAS_301)) {
    try {
      const res = await fetch(`${ORIGIN}${alias}`, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
      const loc = (res.headers.get('location') || '').replace(ORIGIN, '');
      const ok = (res.status === 301 || res.status === 308) && loc === target;
      if (!ok) {
        rows.push({ url: `${ORIGIN}${alias}`, status_code: res.status, canonical: loc, sitemap_included: false, priority_cluster: 'PRIORITY:alias', action_required: 'alias_301_broken' } as Row);
      }
    } catch (e) {
      errors.push({ url: alias, error: String(e) });
    }
  }
}

// Post-paso: unicidad de title/description
for (const r of rows) {
  if (r.title !== undefined) {
    const tDup = (titleCount.get(String(r.title)) || 0) > 1;
    const dDup = r.meta_description ? (descCount.get(String(r.meta_description)) || 0) > 1 : false;
    r.title_is_unique = !tDup;
    r.meta_description_is_unique = !dDup;
    const acts = String(r.action_required || '').split('|').filter(Boolean);
    if (tDup) acts.push('title_duplicate');
    if (dDup) acts.push('description_duplicate');
    r.action_required = acts.join('|');
  }
}

// ───────────────────────── CSV ─────────────────────────

const COLUMNS = ['url', 'status_code', 'canonical', 'canonical_is_self', 'protocol', 'has_http_duplicate', 'indexable', 'robots_meta', 'title', 'title_length', 'title_is_unique', 'meta_description', 'meta_description_length', 'meta_description_is_unique', 'h1', 'h1_count', 'h1_matches_intent', 'word_count_visible', 'has_formula_section', 'has_example_section', 'has_faq_section', 'has_sources_section', 'has_last_updated', 'has_editor', 'has_breadcrumb_schema', 'has_webapp_or_software_schema', 'has_faq_schema', 'internal_links_count', 'related_calculators_count', 'sitemap_included', 'priority_cluster', 'action_required'];

function csvCell(v: unknown): string {
  const s = v === undefined || v === null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

rows.sort((a, b) => {
  const pa = String(a.priority_cluster).startsWith('PRIORITY') ? 0 : 1;
  const pb = String(b.priority_cluster).startsWith('PRIORITY') ? 0 : 1;
  return pa - pb || String(a.url).localeCompare(String(b.url));
});

const csv = [COLUMNS.join(','), ...rows.map((r) => COLUMNS.map((c) => csvCell(r[c])).join(','))].join('\n');
writeFileSync(join(REPORTS, 'seo-audit.csv'), csv);
writeFileSync(join(REPORTS, 'seo-audit-errors.json'), JSON.stringify(errors, null, 2));

// Resumen por consola
const withAction = rows.filter((r) => r.action_required);
const byAction = new Map<string, number>();
for (const r of withAction) for (const a of String(r.action_required).split('|')) byAction.set(a, (byAction.get(a) || 0) + 1);
console.log(`\n✓ ${rows.length} URLs auditadas → reports/seo-audit.csv`);
console.log(`✓ ${errors.length} errores → reports/seo-audit-errors.json`);
console.log('\naction_required:');
for (const [a, n] of [...byAction].sort((x, y) => y[1] - x[1])) console.log(`  ${a}: ${n}`);
const prio = rows.filter((r) => String(r.priority_cluster).startsWith('PRIORITY') && r.action_required);
if (prio.length) {
  console.log('\nPrioritarias con action_required:');
  for (const r of prio) console.log(`  ${String(r.url).replace(ORIGIN, '')} → ${r.action_required}`);
}
