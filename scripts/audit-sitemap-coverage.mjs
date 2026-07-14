#!/usr/bin/env node
/**
 * Audita cobertura del sitemap para PÁGINAS ESTÁTICAS de src/pages.
 *
 * Por qué existe: sitemap-core.xml es una lista hardcodeada a mano
 * (`core('/path', ...)` en scripts/generate-sitemap.ts). Cada vez que alguien
 * agrega una página .astro y se olvida de listarla, la página queda fuera del
 * sitemap —y como el push a IndexNow sale del sitemap, tampoco se envía nunca
 * a Bing/Yandex. Google/Bing sólo la alcanzan por crawl de links.
 *
 * En jul-2026 esto había acumulado 20 páginas indexables invisibles, incluidas
 * /valores-vigentes y /autores/martin-rodriguez (la bio que sostiene el E-E-A-T
 * de todo el sitio). Lo destapó un reporte de Bing, no el tooling.
 *
 * Alcance a propósito acotado a rutas estáticas: las dinámicas ([...slug]) las
 * arma el generador desde el contenido y ya tienen su propio sitemap.
 *
 * Uso:
 *   node scripts/audit-sitemap-coverage.mjs          # reporta, exit 0
 *   node scripts/audit-sitemap-coverage.mjs --check  # exit 1 si falta alguna
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const PAGES = join(ROOT, 'src', 'pages');
const PUBLIC = join(ROOT, 'public');
const SITE = 'https://hacecuentas.com';

/**
 * Páginas que legítimamente no van al sitemap y no son noindex detectable por
 * grep. Si agregás algo acá, dejá el motivo: la lista es la excepción, no el
 * mecanismo.
 */
const ALLOWLIST = new Set([
  '/404',
  '/410',
]);

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (e.endsWith('.astro')) out.push(p);
  }
  return out;
}

/** Ruta dinámica ([slug], [...slug]) o parcial (_foo.astro): no es página estática. */
const isDynamic = (rel) => rel.includes('[') || rel.split('/').some((s) => s.startsWith('_'));

function urlFor(rel) {
  let u = '/' + rel.replace(/\.astro$/, '');
  u = u.replace(/\/index$/, '');
  return u || '/';
}

// --- URLs presentes en cualquier sitemap ------------------------------------
const inSitemap = new Set();
for (const f of readdirSync(PUBLIC).filter((f) => /^sitemap.*\.xml$/.test(f))) {
  const xml = readFileSync(join(PUBLIC, f), 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const path = m[1].replace(SITE, '').replace(/\/$/, '') || '/';
    inSitemap.add(path);
  }
}

// --- Páginas estáticas indexables -------------------------------------------
const missing = [];
for (const abs of walk(PAGES)) {
  const rel = relative(PAGES, abs).replace(/\\/g, '/');
  if (isDynamic(rel)) continue;
  const url = urlFor(rel);
  if (ALLOWLIST.has(url)) continue;
  if (inSitemap.has(url)) continue;
  // noindex declarado en la página (prop del Layout o meta directa).
  const src = readFileSync(abs, 'utf8');
  if (/noindex/.test(src)) continue;
  missing.push({ url, file: `src/pages/${rel}` });
}

const check = process.argv.includes('--check');
if (missing.length === 0) {
  console.log('✅ sitemap coverage: todas las páginas estáticas indexables están en el sitemap.');
  process.exit(0);
}

console.log(`⚠️  ${missing.length} página(s) estática(s) indexable(s) fuera del sitemap:\n`);
for (const m of missing) console.log(`   ${m.url.padEnd(46)} ${m.file}`);
console.log(
  '\nSi corresponde indexarlas: agregá core(\'<url>\', priority, changefreq) en\n' +
  'scripts/generate-sitemap.ts y corré `npm run sitemap`.\n' +
  'Si no: marcá la página noindex, o agregala al ALLOWLIST de este script con el motivo.',
);
process.exit(check ? 1 : 0);
