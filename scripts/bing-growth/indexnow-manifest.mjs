/**
 * IndexNow por CAMBIOS (§27). Construye un manifiesto de URLs indexables con un
 * hash de CONTENIDO (no de build), lo compara contra el manifiesto anterior y
 * emite solo las URLs CREATED / UPDATED / DELETED a reports/bing-growth/indexnow-urls.txt.
 *
 * El hash excluye: hora de build, nonces, tokens, run-ids, metadatos de deploy y
 * fechas editoriales (lastReviewed/lastUpdated) — así un simple bump de fecha NO
 * dispara un envío. Se hashea la proyección de contenido real (title, h1,
 * description, formulaId, fields, outputs, faq, sources, relatedSlugs, secciones).
 *
 * Uso:
 *   node scripts/bing-growth/indexnow-manifest.mjs
 * Primera corrida (sin manifiesto previo): escribe el baseline y NO marca todo
 * como CREATED (evita enviar el sitio entero). Las corridas siguientes detectan
 * cambios reales. La bandera --emit-baseline fuerza emitir todo (uso excepcional).
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { isIndexableCalc } from '../../src/lib/content-policy.ts';

const SITE = 'https://hacecuentas.com';
const MANIFEST = 'reports/bing-growth/current-url-manifest.json';
const PREV = 'reports/bing-growth/previous-url-manifest.json';
const OUT = 'reports/bing-growth/indexnow-urls.txt';
const emitBaseline = process.argv.includes('--emit-baseline');

const LOCALES = {
  calcs: '', 'calcs-mx': '/mx', 'calcs-co': '/co', 'calcs-cl': '/cl', 'calcs-pe': '/pe',
  'calcs-ec': '/ec', 'calcs-ve': '/ve', 'calcs-py': '/py', 'calcs-uy': '/uy', 'calcs-do': '/do',
  'calcs-es': '/es', 'calcs-en': '/en', 'calcs-pt': '/pt', 'calcs-pt-pt': '/pt-pt',
};

// Proyección de contenido estable (sin fechas ni metadatos de build)
function contentProjection(j) {
  return JSON.stringify({
    title: j.title, h1: j.h1, description: j.description, formulaId: j.formulaId,
    fields: (j.fields || []).map((f) => ({ id: f.id, label: f.label, type: f.type })),
    outputs: (j.outputs || []).map((o) => ({ id: o.id, label: o.label })),
    faq: (j.faq || []).map((f) => [f.q, f.a]),
    sources: j.sources, relatedSlugs: j.relatedSlugs, canonicalSlug: j.canonicalSlug,
    answerSnippet: j.answerSnippet, sections: j.sections, options: j.options,
    comparisonTable: j.comparisonTable, verdict: j.verdict,
  });
}
const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 16);

const manifest = {};
function addCalc(dir, prefix) {
  const base = `src/content/${dir}`;
  if (!existsSync(base)) return;
  for (const file of readdirSync(base).filter((f) => f.endsWith('.json'))) {
    let j; try { j = JSON.parse(readFileSync(join(base, file), 'utf8')); } catch { continue; }
    if (!isIndexableCalc(j)) continue; // solo indexables (respeta content-policy)
    const slug = j.slug || file.replace(/\.json$/, '');
    const url = `${SITE}${prefix}/${slug}`;
    manifest[url] = {
      url, sourceFile: join(base, file), contentHash: hash(contentProjection(j)),
      indexable: true, canonical: j.canonicalSlug ? `${SITE}/${j.canonicalSlug}` : url,
      lastmod: j.lastReviewed || (j.dataUpdate && j.dataUpdate.lastUpdated) || '',
    };
  }
}
for (const [dir, prefix] of Object.entries(LOCALES)) addCalc(dir, prefix);
// guías + comparaciones
for (const [dir, routePrefix] of [['guias', '/guia'], ['comparaciones', '/comparar']]) {
  const base = `src/content/${dir}`;
  if (!existsSync(base)) continue;
  for (const file of readdirSync(base).filter((f) => f.endsWith('.json'))) {
    let j; try { j = JSON.parse(readFileSync(join(base, file), 'utf8')); } catch { continue; }
    const slug = j.slug || file.replace(/\.json$/, '');
    const url = `${SITE}${routePrefix}/${slug}`;
    manifest[url] = { url, sourceFile: join(base, file), contentHash: hash(contentProjection(j)), indexable: true, canonical: url, lastmod: j.lastReviewed || '' };
  }
}

// diff contra el manifiesto previo
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : null;
let created = [], updated = [], deleted = [], unchanged = 0;
if (!prev) {
  console.log(`[indexnow-manifest] BASELINE — sin manifiesto previo. Escribo baseline (${Object.keys(manifest).length} URLs). No se emite todo salvo --emit-baseline.`);
} else {
  for (const [url, e] of Object.entries(manifest)) {
    const p = prev[url];
    if (!p) created.push(url);
    else if (p.contentHash !== e.contentHash) updated.push(url);
    else unchanged++;
  }
  for (const url of Object.keys(prev)) if (!manifest[url]) deleted.push(url);
}

// rotar manifiestos: current → previous, nuevo → current
if (existsSync(MANIFEST)) renameSync(MANIFEST, PREV);
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 0) + '\n');

const changed = emitBaseline && !prev ? Object.keys(manifest) : [...created, ...updated, ...deleted];
writeFileSync(OUT, changed.join('\n') + (changed.length ? '\n' : ''));
console.log(`[indexnow-manifest] URLs indexables: ${Object.keys(manifest).length}`);
console.log(`[indexnow-manifest] CREATED=${created.length} UPDATED=${updated.length} DELETED=${deleted.length} UNCHANGED=${unchanged}`);
console.log(`[indexnow-manifest] a enviar (${OUT}): ${changed.length} URLs (lotes de 500 vía indexnow-push.py --changed)`);
