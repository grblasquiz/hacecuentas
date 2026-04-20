#!/usr/bin/env node
/**
 * Analiza uso real de clases CSS en dist/.
 *
 * Para cada .css en _astro/, extrae clases declaradas y reporta cuáles
 * NO aparecen en ningún HTML que referencie ese CSS.
 *
 * Sirve para:
 * - Identificar CSS muerto (rel="stylesheet" huérfano)
 * - Medir % real de CSS aprovechado
 *
 * NO modifica archivos. Solo reporta. Antes de podar manual hay que verificar
 * que ningún componente lo use vía :global() o selectors complejos.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist/client';
const ASTRO = join(DIST, '_astro');

function walk(dir, ext) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, ext));
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out;
}

const htmls = walk(DIST, '.html');
const csss = readdirSync(ASTRO).filter((f) => f.endsWith('.css')).map((f) => join(ASTRO, f));

// Para cada CSS, encontrar HTMLs que lo referencien
const cssToHtmls = new Map();
for (const css of csss) {
  const base = css.replace(DIST, '');
  cssToHtmls.set(css, []);
  for (const h of htmls) {
    const content = readFileSync(h, 'utf8');
    if (content.includes(base)) cssToHtmls.get(css).push(h);
  }
}

// Extraer clases de un CSS (patrones simples: .clase-name)
function extractClasses(css) {
  const matches = css.match(/\.[a-zA-Z][a-zA-Z0-9_-]*/g) || [];
  return [...new Set(matches.map((m) => m.slice(1)))];
}

// Extraer clases usadas en HTMLs (class="..." o className)
function extractUsedClasses(htmls) {
  const used = new Set();
  for (const h of htmls) {
    const content = readFileSync(h, 'utf8');
    const classMatches = content.match(/class="([^"]+)"/g) || [];
    for (const m of classMatches) {
      const classes = m.slice(7, -1).split(/\s+/);
      classes.forEach((c) => used.add(c));
    }
  }
  return used;
}

let totalCss = 0, totalUnused = 0;
const report = [];

for (const css of csss) {
  const content = readFileSync(css, 'utf8');
  const sizeKb = Buffer.byteLength(content, 'utf8') / 1024;
  const classesInCss = extractClasses(content);
  const consumingHtmls = cssToHtmls.get(css);
  if (consumingHtmls.length === 0) {
    report.push({ css: css.replace(ASTRO + '/', ''), size: sizeKb, status: 'ORPHAN (no HTML references it)' });
    totalUnused += sizeKb;
    continue;
  }
  const usedClasses = extractUsedClasses(consumingHtmls);
  const unusedCount = classesInCss.filter((c) => !usedClasses.has(c)).length;
  const unusedPct = (unusedCount / classesInCss.length) * 100;
  report.push({
    css: css.replace(ASTRO + '/', ''),
    size: sizeKb,
    totalClasses: classesInCss.length,
    unusedClasses: unusedCount,
    unusedPct: unusedPct.toFixed(1),
    consumingFiles: consumingHtmls.length,
  });
  totalCss += sizeKb;
}

report.sort((a, b) => b.size - a.size);
console.log(`Análisis CSS usage (top 10 por tamaño):\n`);
console.log(`${'File'.padEnd(50)} ${'Size KB'.padStart(10)} ${'Classes'.padStart(10)} ${'Unused'.padStart(10)} ${'Unused %'.padStart(10)} ${'HTMLs'.padStart(8)}`);
for (const r of report.slice(0, 15)) {
  console.log(
    `${r.css.slice(0, 50).padEnd(50)} ${r.size.toFixed(1).padStart(10)} ${String(r.totalClasses || '-').padStart(10)} ${String(r.unusedClasses || '-').padStart(10)} ${String(r.unusedPct || '-').padStart(10)} ${String(r.consumingFiles || '-').padStart(8)}`,
  );
}

const orphans = report.filter((r) => r.status);
if (orphans.length > 0) {
  console.log(`\n⚠️ CSS HUÉRFANOS (sin HTML que los use):`);
  orphans.forEach((r) => console.log(`  - ${r.css} (${r.size.toFixed(1)} KB)`));
}

console.log(`\nTotal CSS analizado: ${totalCss.toFixed(1)} KB`);
console.log(`Huérfanos: ${totalUnused.toFixed(1)} KB`);
