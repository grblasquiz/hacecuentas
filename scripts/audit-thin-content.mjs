#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'parse5';
import path from 'node:path';

const BUILD_DIR = path.resolve(process.cwd(), 'dist/client');
const REPORT = path.resolve(process.cwd(), 'reports/thin-content-gate.json');
const MIN_WORDS = 180;
const CHECK = process.argv.includes('--check');
const SITE = 'https://hacecuentas.com';

const attrs = (node) => Object.fromEntries((node.attrs || []).map((attr) => [attr.name, attr.value]));
const classList = (node) => String(attrs(node).class || '').split(/\s+/);
const excludedTags = new Set(['script', 'style', 'noscript', 'svg', 'header', 'footer']);
const utilityRoute = (route) =>
  /^\/(?:contacto|cookies|privacidad|terminos|aviso-legal|sugerir|sugerencias|enlazanos|desarrolladores|wordpress|prensa|404)(?:\/|$)/.test(route);

function sitemapLocations(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].replaceAll('&amp;', '&'));
}

function routeFromUrl(url) {
  const pathname = new URL(url, SITE).pathname;
  return pathname === '/' ? '/' : pathname.replace(/\/$/, '');
}

function htmlPathForRoute(route) {
  if (route === '/') return path.join(BUILD_DIR, 'index.html');
  const clean = route.replace(/^\//, '');
  const candidates = [
    path.join(BUILD_DIR, `${clean}.html`),
    path.join(BUILD_DIR, clean, 'index.html'),
  ];
  return candidates.find(existsSync);
}

function collectText(node, state = { inMain: false, excluded: false }, output = []) {
  const nodeAttrs = attrs(node);
  const inMain = state.inMain || node.tagName === 'main';
  const excluded =
    state.excluded ||
    excludedTags.has(node.tagName) ||
    classList(node).includes('hub-interlinking') ||
    classList(node).includes('breadcrumbs') ||
    classList(node).includes('crumbs') ||
    nodeAttrs.role === 'navigation';

  if (node.nodeName === '#text' && inMain && !excluded) output.push(node.value);
  for (const child of node.childNodes || []) collectText(child, { inMain, excluded }, output);
  if (node.content) collectText(node.content, { inMain, excluded }, output);
  return output;
}

function analyze(route, file) {
  const document = parse(readFileSync(file, 'utf8'));
  const text = collectText(document).join(' ').replace(/\s+/g, ' ').trim();
  const words = text.match(/[\p{L}\p{N}][\p{L}\p{N}’'%-]*/gu) || [];
  let title = '';
  let h1 = '';
  let robots = '';

  function walk(node) {
    const nodeAttrs = attrs(node);
    if (node.tagName === 'title') title = (node.childNodes || []).map((child) => child.value || '').join('').trim();
    if (node.tagName === 'h1' && !h1) h1 = collectText(node, { inMain: true, excluded: false }, []).join(' ').trim();
    if (node.tagName === 'meta' && nodeAttrs.name?.toLowerCase() === 'robots') robots = nodeAttrs.content || '';
    for (const child of node.childNodes || []) walk(child);
    if (node.content) walk(node.content);
  }
  walk(document);

  return {
    route,
    words: words.length,
    title,
    h1,
    robots,
    sample: text.slice(0, 240),
  };
}

if (!existsSync(path.join(BUILD_DIR, 'sitemap.xml'))) {
  console.error('[thin-content] Falta dist/client/sitemap.xml. Ejecutá el build primero.');
  process.exit(2);
}

const sitemapIndex = readFileSync(path.join(BUILD_DIR, 'sitemap.xml'), 'utf8');
const childSitemaps = sitemapLocations(sitemapIndex)
  .map((url) => path.basename(new URL(url).pathname))
  .filter((name) => name.endsWith('.xml'));
const routes = new Set();

for (const sitemapName of childSitemaps) {
  const sitemapPath = path.join(BUILD_DIR, sitemapName);
  if (!existsSync(sitemapPath)) continue;
  for (const url of sitemapLocations(readFileSync(sitemapPath, 'utf8'))) routes.add(routeFromUrl(url));
}

const missingFiles = [];
const rows = [];
for (const route of [...routes].sort()) {
  const file = htmlPathForRoute(route);
  if (!file) {
    missingFiles.push(route);
    continue;
  }
  rows.push(analyze(route, file));
}

const evaluated = rows.filter((row) => !utilityRoute(row.route) && !/\bnoindex\b/i.test(row.robots));
const thin = evaluated.filter((row) => row.words < MIN_WORDS).sort((a, b) => a.words - b.words || a.route.localeCompare(b.route));
const report = {
  generatedAt: new Date().toISOString(),
  threshold: MIN_WORDS,
  sitemapPages: routes.size,
  evaluatedPages: evaluated.length,
  exemptUtilityPages: rows.length - evaluated.length,
  missingFiles,
  thinPages: thin.length,
  pages: thin,
};

mkdirSync(path.dirname(REPORT), { recursive: true });
writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`);
console.log(`[thin-content] ${evaluated.length} páginas evaluadas · ${thin.length} debajo de ${MIN_WORDS} palabras · ${missingFiles.length} sin HTML`);
for (const row of thin.slice(0, 50)) console.log(`  ${String(row.words).padStart(3)}  ${row.route}`);

// El gate de integridad valida por separado redirects y HTML faltante. Acá sólo
// bloqueamos contenido que efectivamente existe y puede medirse.
if (CHECK && thin.length > 0) process.exit(1);
