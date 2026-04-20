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

// Inline CSS de ruta específica si pesa menos que este umbral (en KB).
// Elimina render-blocking para Speed Index sin inflar HTML masivamente.
// Target: CSS específicos per-page (<8KB). Componentes grandes (Calculator 28K,
// Footer 24K) NO se inlinean.
const INLINE_THRESHOLD_KB = 8;

// Pattern de archivos CSS candidatos a inline (per-page CSS):
// - index@_@astro.*.css
// - *@_@astro.*.css (page-specific)
const INLINE_PATTERNS = [
  /[a-zA-Z0-9_-]+@_@astro\.[A-Za-z0-9_-]+\.css/,
];

// Leer CSS file desde dist/client/_astro (lookup absoluto)
const cssCache = new Map();
function readCssFile(href) {
  if (cssCache.has(href)) return cssCache.get(href);
  // href es /_astro/xxx.css
  const fpath = join('dist/client', href.startsWith('/') ? href.slice(1) : href);
  try {
    const content = readFileSync(fpath, 'utf8');
    cssCache.set(href, content);
    return content;
  } catch {
    return null;
  }
}

function shouldInline(href) {
  const isMatchedPattern = INLINE_PATTERNS.some((p) => p.test(href));
  if (!isMatchedPattern) return false;
  const content = readCssFile(href);
  if (!content) return false;
  const kb = Buffer.byteLength(content, 'utf8') / 1024;
  return kb <= INLINE_THRESHOLD_KB;
}

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
  // 1. CSS chico específico de ruta → INLINE (elimina render-blocking)
  if (shouldInline(href)) {
    const content = readCssFile(href);
    if (content) {
      // Minificado básico: eliminar comments + whitespace redundante
      const min = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
      return `<style>${min}</style>`;
    }
  }
  // 2. CSS below-fold → DEFER con preload + swap
  if (shouldDefer(href)) {
    return (
      `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">` +
      `<noscript><link rel="stylesheet" href="${href}"></noscript>`
    );
  }
  return match;
}

let filesProcessed = 0;
let linksDeferred = 0;
let linksInlined = 0;

function replaceInHtml(html) {
  let modified = html;
  let deferred = 0;
  let inlined = 0;
  const replaceFn = (m, _a, _b, href) => {
    if (shouldInline(href)) { inlined++; return transformLink(m, '', href); }
    if (shouldDefer(href)) { deferred++; return transformLink(m, '', href); }
    return m;
  };
  modified = modified.replace(
    /<link\s+([^>]*?)rel=['"]stylesheet['"]\s+([^>]*?)href=['"]([^'"]+)['"]([^>]*?)\/?>/g,
    replaceFn,
  );
  modified = modified.replace(
    /<link\s+([^>]*?)href=['"]([^'"]+)['"]\s+([^>]*?)rel=['"]stylesheet['"]([^>]*?)\/?>/g,
    (m, _a, href) => {
      if (shouldInline(href)) { inlined++; return transformLink(m, '', href); }
      if (shouldDefer(href)) { deferred++; return transformLink(m, '', href); }
      return m;
    },
  );
  return { modified, deferred, inlined };
}

const files = walk(DIST);
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const { modified, deferred, inlined } = replaceInHtml(html);
  if (deferred > 0 || inlined > 0) {
    writeFileSync(f, modified);
    filesProcessed++;
    linksDeferred += deferred;
    linksInlined += inlined;
  }
}

console.log(`✓ CSS loading optimized:`);
console.log(`  Files processed: ${filesProcessed}`);
console.log(`  Links inlined (<${INLINE_THRESHOLD_KB}KB route-specific): ${linksInlined}`);
console.log(`  Links deferred (below-fold Footer): ${linksDeferred}`);

// ────────────────────────────────────────────────────────────
// STEP 3: Eliminar CSS huérfanos (archivos que ningún HTML referencia
// tras el inline+defer). Son CSS que quedaron sin uso post-optimización.
// ────────────────────────────────────────────────────────────
import { unlinkSync, existsSync } from 'node:fs';

const ASTRO_DIR = join(DIST, '_astro');
const allCssFiles = existsSync(ASTRO_DIR)
  ? readdirSync(ASTRO_DIR).filter((f) => f.endsWith('.css')).map((f) => join(ASTRO_DIR, f))
  : [];

// Relee todos los HTMLs ahora modificados
const allHtmls = walk(DIST).map((f) => readFileSync(f, 'utf8')).join('\n');

let orphansRemoved = 0;
let orphanKb = 0;
for (const cssFile of allCssFiles) {
  const basename = cssFile.split('/').pop();
  // Si ningún HTML referencia este archivo, es huérfano
  if (!allHtmls.includes(basename)) {
    try {
      const kb = statSync(cssFile).size / 1024;
      unlinkSync(cssFile);
      orphansRemoved++;
      orphanKb += kb;
    } catch {}
  }
}
console.log(`  Orphan CSS removed: ${orphansRemoved} files (${orphanKb.toFixed(1)} KB)`);
