#!/usr/bin/env node
/**
 * Invierte la relación primaria de cada guía hacia su herramienta vigente.
 * Resuelve redirecciones y excluye artículos retirados o no indexables.
 * Genera { ruta: [{ slug, title }] }, con hasta seis guías por herramienta,
 * ordenadas por fecha editorial. HubRelatedPosts las muestra antes del footer.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const OUT = path.join(ROOT, 'src/lib/blog-backlinks.json');

// Slugs podados: el JSON sigue vivo en la colección pero la URL responde 410
// (gone-410.ts) o 301 (pruning-redirects.ts). Linkearlos manda a Google a una
// URL muerta — el gotcha de siempre en este repo. Se parsean por regex porque
// son módulos TS y este script corre en node pelado.
const gone = new Set(); // 410: no hay reemplazo, se descarta el link
const redirect = new Map(); // 301: se reemplaza por el destino vivo
const gone410 = path.join(ROOT, 'src/lib/gone-410.ts');
if (fs.existsSync(gone410)) {
  const src = fs.readFileSync(gone410, 'utf8') +
    fs.readFileSync(path.join(ROOT, 'src/lib/removed-ymyl-hubs.ts'), 'utf8');
  for (const m of src.matchAll(/["'](\/[^"']+)["']\s*,/g)) gone.add(m[1]);
}
const pruning = path.join(ROOT, 'src/lib/pruning-redirects.ts');
if (fs.existsSync(pruning)) {
  const src = fs.readFileSync(pruning, 'utf8');
  for (const m of src.matchAll(/["'](\/[^"']+)["']\s*:\s*["'](\/[^"']+)["']/g)) redirect.set(m[1], m[2]);
}
/** Resuelve un slug de calc a su URL final: null si es 410, el destino si es 301. */
function liveSlug(slug) {
  let url = '/' + String(slug).replace(/^\/+/, '');
  const visited = new Set();
  while (redirect.has(url)) {
    if (visited.has(url) || gone.has(url)) return null;
    visited.add(url); url = redirect.get(url);
  }
  return gone.has(url) ? null : url.replace(/^\//, '');
}

// Mismas colecciones que resuelve src/pages/blog/[slug].astro.
const CALC_DIRS = [
  ['src/content/calcs', ''],
  ['src/content/calcs-co', 'co'],
  ['src/content/calcs-mx', 'mx'],
];

const calcKey = new Map(); // slug → clave con prefijo de locale
for (const [dir, prefix] of CALC_DIRS) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const f of fs.readdirSync(abs)) {
    if (!f.endsWith('.json')) continue;
    const c = JSON.parse(fs.readFileSync(path.join(abs, f), 'utf8'));
    if (!c?.slug || calcKey.has(c.slug)) continue; // AR tiene precedencia
    calcKey.set(c.slug, prefix ? `${prefix}/${c.slug}` : c.slug);
  }
}

// Los destinos actuales son hubs: relatedCalcs ya contiene rutas con '/' inicial.
for (const tool of JSON.parse(fs.readFileSync(path.join(ROOT, 'src/lib/current-tools-index.json'), 'utf8'))) {
  const key = String(tool.slug).replace(/^\//, '');
  calcKey.set(key, key);
}

const entries = []; // { post, title, when, keys: [claves calc en orden] }
let dropped = 0;
for (const f of fs.readdirSync(BLOG_DIR).sort()) {
  if (!f.endsWith('.json')) continue;
  const p = JSON.parse(fs.readFileSync(path.join(BLOG_DIR, f), 'utf8'));
  if (p.noindex || p.canonicalUrl || p.canonicalSlug) continue;
  // El JSON del post puede seguir vivo con la URL podada (410/301). Ya pasó:
  // /blog/guia-imc-peso-saludable responde 410 y el JSON sigue en la colección.
  const postUrl = `/blog/${p.slug}`;
  if (gone.has(postUrl) || redirect.has(postUrl)) {
    console.warn(`  ⚠️  post podado, se omite: ${postUrl}`);
    continue;
  }
  const keys = [];
  for (const rawSlug of p.relatedCalcs || []) {
    const slug = liveSlug(rawSlug);
    if (!slug) { dropped++; console.warn(`  ⚠️  ${p.slug}: calc "${rawSlug}" está en 410`); continue; }
    const key = calcKey.get(slug) || (fs.existsSync(path.join(ROOT, 'src/pages', `${slug}.astro`)) ? slug : null);
    if (!key) {
      dropped++;
      console.warn(`  ⚠️  ${p.slug}: relatedCalcs "${slug}" no existe en ninguna colección`);
      continue;
    }
    keys.push(key);
  }
  entries.push({
    post: p.slug,
    title: p.title.split('|')[0].trim(),
    when: p.updatedDate || p.dateModified || p.date || p.datePublished || '',
    keys,
  });
}
const posts = entries.length;

// Primario = relación editorial explícita, sin repartir notas hacia temas ajenos
// para llenar cupos. Hasta seis guías útiles por herramienta, orden estable.
const grouped = new Map();
for (const e of entries) {
  const key = e.keys[0];
  if (!key) continue;
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push(e);
}
const out = {};
for (const [key, rows] of [...grouped.entries()].sort()) {
  out[key] = rows.sort((a,b) => b.when.localeCompare(a.when) || a.post.localeCompare(b.post))
    .slice(0, 6).map(e => ({slug:e.post, title:e.title}));
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

const coveredPosts = new Set(Object.values(out).flat().map((v) => v.slug)).size;
console.log(`✅ blog-backlinks.json: ${Object.keys(out).length} calcs → ${coveredPosts}/${posts} posts` + (dropped ? ` (${dropped} relatedCalcs sin resolver)` : ''));
