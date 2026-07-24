#!/usr/bin/env node
/**
 * compute-blog-backlinks.mjs — invierte blog.relatedCalcs → calc.blogPost.
 *
 * POR QUÉ: auditoría de internal linking (2026-07-24). El blog emitía 1.684
 * links hacia calcs y recibía sólo ~80 (≈1 por post): 69 de 75 posts del
 * sitemap tenían ≤2 links entrantes. Como el blog es el canal que factura en
 * Bing, el flujo unidireccional le estaba drenando autoridad.
 *
 * Este script genera src/lib/blog-backlinks.json con { <clave calc>: {slug,
 * title} }, que CalcLayoutV2 renderiza como "Seguí leyendo" bajo el contenido.
 *
 * Clave: '<slug>' para AR root, '<cc>/<slug>' para las colecciones de país
 * (blog resuelve calcs de AR, CO y MX).
 *
 * Un calc apunta a UN solo post: gana el post donde el calc aparece más arriba
 * en relatedCalcs (señal de relevancia del autor); desempata el más reciente.
 * Se excluyen posts noindex (no tiene sentido mandarles equity).
 *
 * Uso: npm run blog-backlinks   (o node scripts/compute-blog-backlinks.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const OUT = path.join(ROOT, 'src/lib/blog-backlinks.json');

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

const entries = []; // { post, title, when, keys: [claves calc en orden] }
let dropped = 0;
for (const f of fs.readdirSync(BLOG_DIR).sort()) {
  if (!f.endsWith('.json')) continue;
  const p = JSON.parse(fs.readFileSync(path.join(BLOG_DIR, f), 'utf8'));
  if (p.noindex === true) continue;
  const keys = [];
  for (const slug of p.relatedCalcs || []) {
    const key = calcKey.get(slug);
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

// Asignación en dos pasadas para que NINGÚN post quede sin link entrante:
//  1) cada post reserva su primer calc todavía libre (garantiza cobertura);
//  2) los calcs que sobran se reparten al post que los lista más arriba.
// Sin la pasada 1, los posts nuevos pierden siempre contra los viejos que ya
// reclamaron las calcs grandes y quedan igual de huérfanos que antes.
const best = new Map(); // clave calc → { post, title, rank, when }
const second = new Map(); // clave calc → segundo post (overflow de la pasada 1)
for (const e of entries) {
  const free = e.keys.find((k) => !best.has(k));
  if (free) best.set(free, { post: e.post, title: e.title, rank: e.keys.indexOf(free), when: e.when });
}
// Posts que quedaron sin ningún calc libre: les damos el segundo slot de una
// de sus calcs (cada calc muestra hasta 2 links de "Seguí leyendo").
for (const e of entries) {
  if ([...best.values()].some((v) => v.post === e.post)) continue;
  const k = e.keys.find((k) => !second.has(k));
  if (k) second.set(k, { post: e.post, title: e.title });
}
for (const e of entries) {
  e.keys.forEach((key, rank) => {
    const prev = best.get(key);
    if (!prev) { best.set(key, { post: e.post, title: e.title, rank, when: e.when }); return; }
    // No robar el único link de un post que sólo tiene ése.
    const prevCount = [...best.values()].filter((v) => v.post === prev.post).length;
    if (prevCount <= 1) return;
    if (rank < prev.rank || (rank === prev.rank && e.when > prev.when)) {
      best.set(key, { post: e.post, title: e.title, rank, when: e.when });
    }
  });
}

const out = {};
for (const key of [...new Set([...best.keys(), ...second.keys()])].sort()) {
  const list = [];
  if (best.has(key)) list.push({ slug: best.get(key).post, title: best.get(key).title });
  if (second.has(key)) list.push({ slug: second.get(key).post, title: second.get(key).title });
  out[key] = list;
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

const coveredPosts = new Set(Object.values(out).flat().map((v) => v.slug)).size;
console.log(`✅ blog-backlinks.json: ${Object.keys(out).length} calcs → ${coveredPosts}/${posts} posts` + (dropped ? ` (${dropped} relatedCalcs sin resolver)` : ''));
