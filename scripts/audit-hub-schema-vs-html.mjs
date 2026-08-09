#!/usr/bin/env node
/**
 * Audit schema ↔ visible-HTML consistency over the built site.
 *
 * Recorre todos los .html bajo dist/client y extrae del JSON-LD:
 *   - FAQPage.mainEntity[].name  → cada pregunta debe existir como texto visible
 *   - BreadcrumbList último item → su name debe aparecer como texto visible (H1 esperado)
 * y las compara contra el texto visible de la página.
 *
 * Informativo: SIEMPRE exit 0 (no es gate de build).
 * Uso: node scripts/audit-hub-schema-vs-html.mjs [--json out.json] [--limit N]
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { globSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist', 'client');

if (!existsSync(DIST)) {
  console.error(
    `[audit-hub-schema-vs-html] No existe ${DIST}.\n` +
      'Corré este audit DESPUÉS de un build (npm run build) — compara el HTML renderizado, no el fuente.'
  );
  process.exit(0); // informativo, nunca rompe pipelines
}

const args = process.argv.slice(2);
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;

// --- helpers -------------------------------------------------------------
const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');

// Normaliza para comparar texto: sin tags, entidades decodificadas, whitespace colapsado,
// sin acentos raros de encoding y case-insensitive.
const norm = (s) =>
  decode(String(s))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

function visibleText(html) {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<head[\s\S]*?<\/head>/i, ' ');
  return norm(s);
}

// --- main ----------------------------------------------------------------
let files;
try {
  files = globSync('**/*.html', { cwd: DIST }).map((f) => join(DIST, f));
} catch {
  // Node <22: fallback recursivo
  const { readdirSync, statSync } = await import('node:fs');
  const out = [];
  const rec = (d) => {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) rec(p);
      else if (e.endsWith('.html')) out.push(p);
    }
  };
  rec(DIST);
  files = out;
}

const report = [];
for (const file of files) {
  let html;
  try {
    html = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  const ldBlocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  if (!ldBlocks.length) continue;

  const faqQuestions = [];
  let breadcrumbLeaf = null;
  for (const m of ldBlocks) {
    let data;
    try {
      data = JSON.parse(decode(m[1]));
    } catch {
      continue;
    }
    const nodes = Array.isArray(data) ? data : data['@graph'] || [data];
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue;
      if (node['@type'] === 'FAQPage' && Array.isArray(node.mainEntity)) {
        for (const q of node.mainEntity) if (q?.name) faqQuestions.push(q.name);
      }
      if (node['@type'] === 'BreadcrumbList' && Array.isArray(node.itemListElement) && node.itemListElement.length) {
        breadcrumbLeaf = node.itemListElement[node.itemListElement.length - 1]?.name ?? breadcrumbLeaf;
      }
    }
  }
  if (!faqQuestions.length && !breadcrumbLeaf) continue;

  const text = visibleText(html);
  const missingFaq = faqQuestions.filter((q) => !text.includes(norm(q)));
  const h1m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const visibleH1 = h1m ? norm(h1m[1]) : null;
  // El name del breadcrumb hoja debería aparecer visible (idealmente ser el H1)
  const breadcrumbMismatch =
    breadcrumbLeaf && !text.includes(norm(breadcrumbLeaf)) ? { schema: breadcrumbLeaf, visibleH1: h1m ? decode(h1m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim() : null } : null;

  if (missingFaq.length || breadcrumbMismatch) {
    report.push({
      page: '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\.html$/, ''),
      faqInSchema: faqQuestions.length,
      faqMissingVisible: missingFaq,
      breadcrumbMismatch,
    });
  }
}

report.sort((a, b) => (b.faqMissingVisible.length + (b.breadcrumbMismatch ? 1 : 0)) - (a.faqMissingVisible.length + (a.breadcrumbMismatch ? 1 : 0)));

console.log(`\n[audit-hub-schema-vs-html] ${files.length} páginas HTML analizadas · ${report.length} con mismatch schema↔visible\n`);
for (const r of report) {
  console.log(`✗ ${r.page}`);
  if (r.breadcrumbMismatch)
    console.log(`   h1/breadcrumb schema NO visible: "${r.breadcrumbMismatch.schema}"  (H1 visible: "${r.breadcrumbMismatch.visibleH1}")`);
  if (r.faqMissingVisible.length)
    console.log(`   FAQ del schema sin contraparte visible (${r.faqMissingVisible.length}/${r.faqInSchema}): ${r.faqMissingVisible.slice(0, 3).map((q) => `"${q}"`).join(' · ')}${r.faqMissingVisible.length > 3 ? ' …' : ''}`);
}
if (!report.length) console.log('✓ Sin divorcios schema↔HTML detectados.');
if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify(report, null, 2));
  console.log(`\nReporte JSON → ${jsonOut}`);
}
process.exit(0);
