/**
 * Gate post-build: impide desplegar un catálogo machine-readable que anuncie
 * aliases, rutas retiradas o páginas sin HTML/canonical propio.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { GONE_410_URLS } from '../src/lib/gone-410.ts';
import { PRUNING_REDIRECTS } from '../src/lib/pruning-redirects.ts';
import { SEO_TITLE_MAX_LENGTH } from '../src/lib/seo-title.ts';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = resolve(ROOT, 'dist/client');
const API_FILE = resolve(DIST, 'api/calcs-index.json');
const WRAPPER = resolve(ROOT, 'dist/server/wrapper.mjs');
const ORIGIN = 'https://hacecuentas.com';
const STATIC_REDIRECT_PATHS = new Set(
  readFileSync(resolve(ROOT, 'public/_redirects'), 'utf8')
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

// Guardrails para los tres warnings recurrentes del auditor de Bing (2026-07):
// title largo, imágenes de categoría con alt vacío y doble H1 en Mi Hacé Cuentas.
for (const file of compiledHtmlFiles) {
  const html = readFileSync(file, 'utf8');
  const relative = file.replace(`${DIST}/`, '');
  const robots = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)/i)?.[1] || '';
  const titleRaw = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '';
  const title = decodeHtmlText(titleRaw)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (title && !/\bnoindex\b/i.test(robots) && title.length > SEO_TITLE_MAX_LENGTH) {
    errors.push(`title largo (${title.length}): ${relative}`);
  }

  if (/^categoria\/[^/]+(?:\/\d+)?\.html$/.test(relative)) {
    for (const image of html.match(/<img\b[^>]*>/gi) || []) {
      if (!/\balt=["'][^"']+["']/i.test(image)) {
        errors.push(`imagen de categoría sin alt descriptivo: ${relative}`);
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

// El wrapper debe contener el mapa completo: los HTML retirados se borran del
// build, por lo que este código es quien garantiza su 301/410 en producción.
const wrapper = readFileSync(WRAPPER, 'utf8');
for (const [from, to] of Object.entries(PRUNING_REDIRECTS)) {
  if (!wrapper.includes(JSON.stringify(from)) || !wrapper.includes(JSON.stringify(to))) {
    errors.push(`redirect ausente del wrapper: ${from} -> ${to}`);
    if (errors.length >= 50) break;
  }
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
