#!/usr/bin/env node
/**
 * Post-build: borra los HTML estáticos de las URLs en PRUNING_REDIRECTS y
 * GONE_410_URLS, para que CF Workers Static Assets caiga al Worker (middleware)
 * y aplique el redirect / status correspondiente.
 *
 * Razón: CF Workers sirve los HTML de `dist/client/*.html` ANTES de invocar al
 * Worker. Si el HTML existe, el middleware nunca corre y la URL devuelve 200
 * en lugar del 301/410 esperado. Borrando los HTML, CF "no encuentra" el
 * asset → cae al Worker → middleware aplica la respuesta correcta.
 *
 * Verificado el bug 2026-05-13: 5 URLs sample del batch 2 devolvían 200 en
 * vivo pese a estar en `src/lib/pruning-redirects.ts`.
 */
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const DIST_CLIENT = join(REPO_ROOT, 'dist', 'client');

// ---- Parse PRUNING_REDIRECTS keys (301 redirects) -------------------------
const pruningTs = readFileSync(
  join(REPO_ROOT, 'src', 'lib', 'pruning-redirects.ts'),
  'utf8',
);
const keyRegex = /'(\/[^']+)':\s*'/g;
const prunedPaths = [];
let m;
while ((m = keyRegex.exec(pruningTs)) !== null) {
  prunedPaths.push(m[1]);
}

// ---- Parse GONE_410_URLS (410 Gone responses) -----------------------------
const goneTs = readFileSync(
  join(REPO_ROOT, 'src', 'lib', 'gone-410.ts'),
  'utf8',
);
const goneRegex = /"(\/[^"]+)"/g;
const gonePaths = [];
let g;
while ((g = goneRegex.exec(goneTs)) !== null) {
  gonePaths.push(g[1]);
}

const allPaths = [...prunedPaths, ...gonePaths];
if (allPaths.length === 0) {
  console.warn('[strip-pruned-html] No paths found, nothing to do.');
  process.exit(0);
}

let removed = 0;
let missing = 0;
for (const path of allPaths) {
  // dist/client serves `/foo` from `dist/client/foo.html` (Astro `format: file`).
  const htmlPath = join(DIST_CLIENT, `${path.slice(1)}.html`);
  if (existsSync(htmlPath)) {
    rmSync(htmlPath);
    removed++;
  } else {
    missing++;
  }
}

console.log(
  `[strip-pruned-html] Removed ${removed} HTML files (${prunedPaths.length} pruning + ${gonePaths.length} gone-410, ` +
    `${missing} were already missing). Middleware will apply 301/410.`,
);
