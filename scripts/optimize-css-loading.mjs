#!/usr/bin/env node
/**
 * Post-build: defer non-critical CSS loading.
 *
 * El CSS del Footer (24 KB, ~6.8 KiB gzip) bloqueaba render inicial en
 * ~170ms según PageSpeed. Problema: todos esos KB se cargan antes del
 * LCP aunque el Footer esté below-fold.
 *
 * Solución:
 *   <link rel="stylesheet" href="...Footer.css">
 * →
 *   <link rel="preload" href="..." as="style" onload="this.onload=null;this.rel='stylesheet'">
 *   <noscript><link rel="stylesheet" href="..."></noscript>
 *
 * Técnica: media="print" + swap. El browser baja el CSS pero NO bloquea
 * render. Cuando termina, el JS cambia rel="stylesheet" y se aplica.
 *
 * Aplicamos a CSS below-fold:
 * - Footer.*.css (definitivamente below-fold)
 * - Otros CSS secundarios que podamos identificar por patrón
 *
 * NO aplicamos a:
 * - CSS del Layout principal (crítico, above-fold)
 * - CSS específico de la ruta (index@_@astro, calcs, etc.) — pueden tener
 *   estilos del hero/above-fold
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist/client';

// Patterns de CSS a diferir (below-fold safe)
const DEFER_PATTERNS = [
  /Footer\.[A-Za-z0-9_-]+\.css/,
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function shouldDefer(href) {
  return DEFER_PATTERNS.some((p) => p.test(href));
}

function transformLink(match, attrs, href) {
  if (!shouldDefer(href)) return match;
  // Técnica preload + swap a stylesheet + noscript fallback
  return (
    `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">` +
    `<noscript><link rel="stylesheet" href="${href}"></noscript>`
  );
}

let filesProcessed = 0;
let linksDeferred = 0;
let bytesSaved = 0;

const files = walk(DIST);
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  let modified = html;
  let count = 0;
  modified = modified.replace(
    /<link\s+([^>]*?)rel=['"]stylesheet['"]\s+([^>]*?)href=['"]([^'"]+)['"]([^>]*?)\/?>/g,
    (m, _a, _b, href) => {
      const newTag = transformLink(m, '', href);
      if (newTag !== m) count++;
      return newTag;
    },
  );
  // También el orden inverso: href antes que rel
  modified = modified.replace(
    /<link\s+([^>]*?)href=['"]([^'"]+)['"]\s+([^>]*?)rel=['"]stylesheet['"]([^>]*?)\/?>/g,
    (m, _a, href) => {
      const newTag = transformLink(m, '', href);
      if (newTag !== m) count++;
      return newTag;
    },
  );
  if (count > 0) {
    writeFileSync(f, modified);
    filesProcessed++;
    linksDeferred += count;
    bytesSaved += Math.round((modified.length - html.length) / 1024);
  }
}

console.log(`✓ CSS loading optimized:`);
console.log(`  Files processed: ${filesProcessed}`);
console.log(`  Links deferred: ${linksDeferred}`);
