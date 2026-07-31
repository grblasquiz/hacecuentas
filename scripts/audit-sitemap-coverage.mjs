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
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const PAGES = join(ROOT, 'src', 'pages');
const PUBLIC = join(ROOT, 'public');
const PRUNING = join(ROOT, 'src', 'lib', 'pruning-redirects.ts');
const GONE = join(ROOT, 'src', 'lib', 'gone-410.ts');
const REDIRECTS = join(PUBLIC, '_redirects');
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

// Segmentos utilitarios fuera del sitemap a propósito (ver generate-sitemap.ts):
// navegación/producto que en 90 días de Bing dio 0 impresiones en TODAS sus URLs.
// Siguen vivas, linkeadas e indexables; sólo no las proponemos para crawl.
const ALLOWED_PREFIXES = [
  '/decidir', '/comparar', '/partners',
  '/mi', '/informes', '/fin-de-semana',
];
const isAllowedPrefix = (u) =>
  ALLOWED_PREFIXES.some((p) => u === p || u.startsWith(p + '/'));

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

// --- URLs presentes en sitemaps referenciados por el índice -----------------
// `public/` puede conservar XML de builds anteriores. Auditar por glob producía
// falsos positivos (una URL retirada del índice seguía contando como publicada)
// y falsos negativos (una estática parecía cubierta por un sitemap huérfano).
// sitemap.xml es la única fuente de verdad.
const inSitemap = new Set();
const indexXml = readFileSync(join(PUBLIC, 'sitemap.xml'), 'utf8');
const referencedSitemaps = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => {
    try {
      const url = new URL(m[1].trim());
      if (url.origin !== SITE) return null;
      return basename(url.pathname);
    } catch {
      return null;
    }
  })
  .filter((file) => file && /^sitemap-[a-z0-9-]+\.xml$/i.test(file));
const missingSitemapFiles = [];
for (const f of referencedSitemaps) {
  const sitemapPath = join(PUBLIC, f);
  try {
    const xml = readFileSync(sitemapPath, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const path = m[1].replace(SITE, '').replace(/\/$/, '') || '/';
      inSitemap.add(path);
    }
  } catch {
    missingSitemapFiles.push(f);
  }
}

// Una URL publicada en sitemap debe responder 200 indexable. En julio de 2026
// siete rutas vivas quedaron también en un batch de pruning: el sitemap las
// anunciaba mientras el Worker las convertía en 301 hacia destinos ajenos.
// Este gate cruza todas las fuentes que pueden retirar una URL para impedir que
// esa contradicción vuelva a llegar a producción.
const retired = new Map();
for (const m of readFileSync(PRUNING, 'utf8').matchAll(/['"](\/[^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g)) {
  retired.set(m[1], `301 pruning → ${m[2]}`);
}
const goneSources = readFileSync(GONE, 'utf8') + readFileSync(join(ROOT, 'src', 'lib', 'removed-ymyl-hubs.ts'), 'utf8');
for (const line of goneSources.split(/\r?\n/)) {
  const m = line.match(/^\s*["'](\/[^"']+)["'],?\s*$/);
  if (m) retired.set(m[1], '410 Gone');
}
for (const line of readFileSync(REDIRECTS, 'utf8').split(/\r?\n/)) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 3 || !/^30[1278]$/.test(parts.at(-1) || '')) continue;
  const [source, target] = parts;
  if (!source.startsWith('/') || /[*:]/.test(source)) continue;
  const normalizedSource = source.replace(/\/$/, '') || '/';
  let normalizedTarget = target;
  try {
    normalizedTarget = new URL(target, SITE).pathname;
  } catch {
    // Un destino no parseable igual se conserva como redirect real.
  }
  normalizedTarget = normalizedTarget.replace(/\/$/, '') || '/';
  // /mx/ → /mx sólo normaliza trailing slash: no retira la URL canónica /mx.
  if (normalizedSource === normalizedTarget) continue;
  retired.set(normalizedSource, `${parts.at(-1)} redirect → ${target}`);
}

const retiredInSitemap = [...inSitemap]
  .filter((path) => retired.has(path))
  .sort()
  .map((path) => ({ path, reason: retired.get(path) }));

// --- Páginas estáticas indexables -------------------------------------------
const missing = [];
for (const abs of walk(PAGES)) {
  const rel = relative(PAGES, abs).replace(/\\/g, '/');
  if (isDynamic(rel)) continue;
  const url = urlFor(rel);
  if (ALLOWLIST.has(url) || isAllowedPrefix(url)) continue;
  if (inSitemap.has(url)) continue;
  // noindex declarado en la página (prop del Layout o meta directa).
  const src = readFileSync(abs, 'utf8');
  if (/noindex/.test(src)) continue;
  missing.push({ url, file: `src/pages/${rel}` });
}

const check = process.argv.includes('--check');
if (missingSitemapFiles.length === 0) {
  console.log(`✅ sitemap index: ${referencedSitemaps.length} archivos referenciados y presentes.`);
} else {
  console.log(`❌ ${missingSitemapFiles.length} sitemap(s) referenciado(s) no existen en public/:`);
  for (const file of missingSitemapFiles) console.log(`   ${file}`);
}

if (missing.length === 0) {
  console.log('✅ sitemap coverage: todas las páginas estáticas indexables están en el sitemap.');
} else {
  console.log(`⚠️  ${missing.length} página(s) estática(s) indexable(s) fuera del sitemap:\n`);
  for (const m of missing) console.log(`   ${m.url.padEnd(46)} ${m.file}`);
  console.log(
    '\nSi corresponde indexarlas: agregá core(\'<url>\', priority, changefreq) en\n' +
    'scripts/generate-sitemap.ts y corré `npm run sitemap`.\n' +
    'Si no: marcá la página noindex, o agregala al ALLOWLIST de este script con el motivo.\n',
  );
}

if (retiredInSitemap.length === 0) {
  console.log('✅ sitemap integrity: ninguna URL publicada está redirigida ni devuelve 410.');
} else {
  console.log(`❌ ${retiredInSitemap.length} URL(s) del sitemap están retiradas por otra regla:\n`);
  for (const item of retiredInSitemap) {
    console.log(`   ${item.path.padEnd(64)} ${item.reason}`);
  }
  console.log('\nQuitá la URL de la fuente de pruning/410/redirect o del sitemap antes de desplegar.\n');
}

process.exit(check && (
  missingSitemapFiles.length > 0 ||
  missing.length > 0 ||
  retiredInSitemap.length > 0
) ? 1 : 0);
