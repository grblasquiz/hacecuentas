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
 *
 * ──────────────────────────────────────────────────────────────────────
 * Por qué NO usamos beasties/critters (evaluado 2026-04-26):
 *
 * Beasties extrae rules realmente "usadas" por el document, pero NO tiene
 * concepto de viewport / above-the-fold (lo dice su propio README: no usa
 * headless browser). Resultado en sample 3 páginas:
 *   - index.html:   <head> 19KB → 75KB (+55KB)
 *   - aguinaldo:    <head> 16KB → 59KB (+42KB)
 *   - vo2-max:      <head> 23KB → 96KB (+73KB)
 *
 * Inlinea todos los rules del Footer.css (24KB) en el <head>, anulando
 * todo el ahorro del defer + empujando el LCP más abajo.
 *
 * El approach actual (inline <8KB route-specific + defer Footer + remove
 * orphan CSS) es la mejor heurística sin runtime overhead. Para mejorar
 * de verdad haría falta un headless-browser pass per-route, lo cual a
 * 3833 páginas es prohibitivo en CI.
 * ──────────────────────────────────────────────────────────────────────
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

// ── modulepreload de lib-shared ──────────────────────────────────────
// lib-shared lo importan ESTÁTICAMENTE los chunks de Layout y Calculator, pero
// el browser sólo lo descubre tras parsear el chunk de entrada (waterfall de
// 2 hops). Un <link rel="modulepreload"> en el <head> lo baja en paralelo,
// ahorrando 1 RTT en la primera visita (= las landings de Ads). Sólo lo
// inyectamos si el HTML ya referencia un chunk de _astro (o sea, hidrata algo).
import { readdirSync as _readdir2 } from 'node:fs';
let LIB_SHARED_HREF = null;
try {
  const _astro = _readdir2(join(DIST, '_astro'));
  const _lib = _astro.find((f) => /^lib-shared\.[A-Za-z0-9_-]+\.js$/.test(f));
  if (_lib) LIB_SHARED_HREF = `/_astro/${_lib}`;
} catch {}

let preloadsInjected = 0;
function injectModulePreload(html) {
  if (!LIB_SHARED_HREF) return html;
  if (html.includes('rel="modulepreload"') && html.includes(LIB_SHARED_HREF)) return html;
  // Sólo si la página hidrata algo (tiene scripts de _astro) y tiene </head>.
  if (!/<script[^>]+type=["']module["'][^>]+_astro/.test(html)) return html;
  if (!html.includes('</head>')) return html;
  preloadsInjected++;
  return html.replace('</head>', `<link rel="modulepreload" href="${LIB_SHARED_HREF}"></head>`);
}

const files = walk(DIST);
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const { modified, deferred, inlined } = replaceInHtml(html);
  const withPreload = injectModulePreload(modified);
  if (deferred > 0 || inlined > 0 || withPreload !== modified) {
    writeFileSync(f, withPreload);
    filesProcessed++;
    linksDeferred += deferred;
    linksInlined += inlined;
  }
}
console.log(`  modulepreload(lib-shared) injected: ${preloadsInjected}${LIB_SHARED_HREF ? ' → ' + LIB_SHARED_HREF : ' (chunk no encontrado)'}`);

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

// Streaming check: leer HTMLs uno por uno y registrar qué CSS files referencian.
// Antes: join('\n') de todos los HTMLs → RangeError "Invalid string length" cuando
// el total supera ~512MB (límite V8). Tras el fix masivo de 145 calcs broken
// (2026-05-19, commit dfdd909e), el total de HTML pasó de ~6MB a ~300MB+ porque
// las 145 calcs ahora renderean HTML completo (~114KB en vez de ~43KB).
const referencedCss = new Set();
const cssBasenames = allCssFiles.map((p) => p.split('/').pop());
for (const f of walk(DIST)) {
  const html = readFileSync(f, 'utf8');
  for (const basename of cssBasenames) {
    if (!referencedCss.has(basename) && html.includes(basename)) {
      referencedCss.add(basename);
    }
  }
  // early-exit si ya encontramos todos los CSS referenciados
  if (referencedCss.size === cssBasenames.length) break;
}

let orphansRemoved = 0;
let orphanKb = 0;
for (const cssFile of allCssFiles) {
  const basename = cssFile.split('/').pop();
  // Si ningún HTML referencia este archivo, es huérfano
  if (!referencedCss.has(basename)) {
    try {
      const kb = statSync(cssFile).size / 1024;
      unlinkSync(cssFile);
      orphansRemoved++;
      orphanKb += kb;
    } catch {}
  }
}
console.log(`  Orphan CSS removed: ${orphansRemoved} files (${orphanKb.toFixed(1)} KB)`);
