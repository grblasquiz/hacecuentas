/**
 * Gate post-build: impide desplegar un catálogo machine-readable que anuncie
 * aliases, rutas retiradas o páginas sin HTML/canonical propio.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { GONE_410_URLS } from '../src/lib/gone-410.ts';
import { PRUNING_REDIRECTS } from '../src/lib/pruning-redirects.ts';
import { SEO_TITLE_MAX_LENGTH } from '../src/lib/seo-title.ts';
import {
  combineRedirectEntries,
  flattenRedirectGraph,
  parseCloudflareRedirects,
  parsePruningRedirects,
  toWorkerRedirectMap,
} from './lib/redirect-graph.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = resolve(ROOT, 'dist/client');
const API_FILE = resolve(DIST, 'api/calcs-index.json');
const WRAPPER = resolve(ROOT, 'dist/server/wrapper.mjs');
const ORIGIN = 'https://hacecuentas.com';
const STATIC_REDIRECTS_TEXT = readFileSync(resolve(ROOT, 'public/_redirects'), 'utf8');
const STATIC_REDIRECT_PATHS = new Set(
  STATIC_REDIRECTS_TEXT
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/))
    .filter((parts) => parts.length >= 3 && /^30[1278]$/.test(parts.at(-1) || ''))
    .map((parts) => parts[0]),
);

function normalizeUrl(value: string): string {
  const u = new URL(value, ORIGIN);
  const path = (u.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/');
  return `${ORIGIN}${path}`;
}

function htmlFileFor(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  return resolve(DIST, clean ? `${clean}.html` : 'index.html');
}

function htmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...htmlFiles(path));
    else if (entry.name.endsWith('.html')) out.push(path);
  }
  return out;
}

function decodeHtmlText(value: string): string {
  const named: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&([a-z]+);/gi, (entity, name) => named[name.toLowerCase()] ?? entity);
}

if (!existsSync(API_FILE)) throw new Error(`[integrity] falta ${API_FILE}`);
if (!existsSync(WRAPPER)) throw new Error(`[integrity] falta ${WRAPPER}`);

const api = JSON.parse(readFileSync(API_FILE, 'utf8'));
const entries: Array<{ url: string; slug: string }> = api.calculators || [];
const errors: string[] = [];
const seen = new Set<string>();
const compiledHtmlFiles = htmlFiles(DIST);

for (const entry of entries) {
  let url: URL;
  try {
    url = new URL(entry.url);
  } catch {
    errors.push(`URL inválida: ${entry.url}`);
    continue;
  }
  const path = url.pathname.replace(/\/$/, '') || '/';
  if (url.origin !== ORIGIN) errors.push(`origen externo en API: ${entry.url}`);
  if (seen.has(path)) errors.push(`URL duplicada en API: ${path}`);
  seen.add(path);
  if (GONE_410_URLS.has(path)) errors.push(`URL 410 publicada en API: ${path}`);
  if (path in PRUNING_REDIRECTS) errors.push(`URL 301 publicada en API: ${path}`);
  if (STATIC_REDIRECT_PATHS.has(path)) errors.push(`URL redirigida por _redirects publicada en API: ${path}`);

  const file = htmlFileFor(path);
  if (!existsSync(file)) {
    errors.push(`sin HTML propio: ${path}`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  const canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)
    ?? html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  if (!canonical) {
    errors.push(`sin canonical: ${path}`);
  } else if (normalizeUrl(canonical[1]) !== normalizeUrl(entry.url)) {
    errors.push(`canonical ajeno: ${path} -> ${canonical[1]}`);
  }
}

// Ninguna página compilada puede seguir enlazando aliases 301 o retiradas 410.
// Este gate cubre catálogos, relacionadas, rails y links editoriales completos.
let internalHrefCount = 0;
for (const file of compiledHtmlFiles) {
  const html = readFileSync(file, 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  for (const match of html.matchAll(/href=["'](\/[^"'?#\s]*)/gi)) {
    const path = match[1].replace(/\.html$/, '').replace(/\/$/, '') || '/';
    internalHrefCount++;
    if (GONE_410_URLS.has(path)) errors.push(`href interno a 410: ${path} (${file.replace(`${DIST}/`, '')})`);
    if (path in PRUNING_REDIRECTS) errors.push(`href interno a 301: ${path} (${file.replace(`${DIST}/`, '')})`);
    if (STATIC_REDIRECT_PATHS.has(path)) errors.push(`href interno a _redirects: ${path} (${file.replace(`${DIST}/`, '')})`);
    if (errors.length >= 50) break;
  }
  if (errors.length >= 50) break;
}

// Guardrails para los warnings recurrentes del auditor SEO: title largo,
// imágenes sin alt y páginas indexables sin un H1 server-side. El HTML dentro
// de scripts/templates no cuenta: puede contener mockups o strings que luego
// se montan en el navegador y no son señales SEO iniciales.
for (const file of compiledHtmlFiles) {
  const html = readFileSync(file, 'utf8');
  const relative = file.replace(`${DIST}/`, '');
  const hasNoindex = [...html.matchAll(/<meta\b[^>]*>/gi)].some(([tag]) =>
    /\bname=["']robots["']/i.test(tag) &&
    /\bcontent=["'][^"']*\bnoindex\b[^"']*["']/i.test(tag),
  );
  const renderableHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const isIndexable = !hasNoindex;
  const titleRaw = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '';
  const title = decodeHtmlText(titleRaw)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (title && isIndexable && title.length > SEO_TITLE_MAX_LENGTH) {
    errors.push(`title largo (${title.length}): ${relative}`);
  }

  if (isIndexable) {
    const h1Count = (renderableHtml.match(/<h1\b/gi) || []).length;
    if (h1Count !== 1) {
      errors.push(`página indexable debe tener 1 H1 server-side, tiene ${h1Count}: ${relative}`);
    }
    for (const image of renderableHtml.match(/<img\b[^>]*>/gi) || []) {
      // alt="" es válido para imágenes decorativas; lo que no puede faltar es
      // el atributo, que es lo que reporta el crawler.
      if (!/\balt\s*=\s*["'][^"']*["']/i.test(image)) {
        errors.push(`imagen sin atributo alt: ${relative}`);
        break;
      }
    }
  }

  if (relative === 'mi-hacecuentas.html') {
    const h1Count = (html.match(/<h1\b/gi) || []).length;
    if (h1Count !== 1) errors.push(`mi-hacecuentas debe tener 1 H1, tiene ${h1Count}`);
  }

  if (errors.length >= 50) break;
}

// El wrapper debe contener el mapa combinado EXACTO y aplanado. Buscar `from`
// y `to` como strings sueltos no alcanza: un target intermedio también aparece
// como source y ocultaba regresiones A→B→C. Esta comparación garantiza que cada
// request responde A→C en un solo salto.
const wrapper = readFileSync(WRAPPER, 'utf8');
const pruningEntries = parsePruningRedirects(
  readFileSync(resolve(ROOT, 'src/lib/pruning-redirects.ts'), 'utf8'),
);
const staticEntries = parseCloudflareRedirects(STATIC_REDIRECTS_TEXT).entries;
const { map: rawRedirectMap } = combineRedirectEntries(pruningEntries, staticEntries);
const { flattened: expectedRedirects } = flattenRedirectGraph(rawRedirectMap);
const expectedRedirectMap = toWorkerRedirectMap(expectedRedirects);
const expectedRedirectDeclaration =
  `const REDIRECT_MAP = Object.freeze(${JSON.stringify(expectedRedirectMap)});`;
if (!wrapper.includes(expectedRedirectDeclaration)) {
  errors.push(
    `REDIRECT_MAP del wrapper no coincide con el grafo combinado aplanado ` +
      `(${Object.keys(expectedRedirectMap).length} sources)`,
  );
}
if (errors.length < 50) {
  for (const path of GONE_410_URLS) {
    if (!wrapper.includes(JSON.stringify(path))) {
      errors.push(`410 ausente del wrapper: ${path}`);
      if (errors.length >= 50) break;
    }
  }
}

if (errors.length) {
  console.error(`[integrity] FALLÓ con ${errors.length} error(es):`);
  for (const error of errors.slice(0, 50)) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`[integrity] OK: ${entries.length} URLs públicas y ${internalHrefCount} href internos con HTML, canonical y routing coherentes`);
