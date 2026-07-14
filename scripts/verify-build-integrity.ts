/**
 * Gate post-build: impide desplegar un catálogo machine-readable que anuncie
 * aliases, rutas retiradas o páginas sin HTML/canonical propio.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GONE_410_URLS } from '../src/lib/gone-410.ts';
import { PRUNING_REDIRECTS } from '../src/lib/pruning-redirects.ts';

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

if (!existsSync(API_FILE)) throw new Error(`[integrity] falta ${API_FILE}`);
if (!existsSync(WRAPPER)) throw new Error(`[integrity] falta ${WRAPPER}`);

const api = JSON.parse(readFileSync(API_FILE, 'utf8'));
const entries: Array<{ url: string; slug: string }> = api.calculators || [];
const errors: string[] = [];
const seen = new Set<string>();

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

console.log(`[integrity] OK: ${entries.length} URLs públicas con HTML, canonical y routing coherentes`);
