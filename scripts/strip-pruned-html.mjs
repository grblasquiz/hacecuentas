#!/usr/bin/env node
/**
 * Post-build: borra los HTML estáticos de las URLs que están en
 * PRUNING_REDIRECTS, para que CF Pages caiga al Worker (middleware) y
 * aplique el 301.
 *
 * Razón: CF Pages sirve los HTML de `dist/client/*.html` ANTES de invocar al
 * Worker. Si el HTML existe, el middleware nunca corre y la URL devuelve 200
 * en lugar del 301 esperado. Borrando los HTML, CF Pages "no encuentra" el
 * asset → cae al Worker → middleware aplica el redirect.
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

// Parse the PRUNING_REDIRECTS keys from the TS file (simple regex extraction).
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

if (prunedPaths.length === 0) {
  console.warn('[strip-pruned-html] No pruning paths found, nothing to do.');
  process.exit(0);
}

let removed = 0;
let missing = 0;
for (const path of prunedPaths) {
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
  `[strip-pruned-html] Removed ${removed} HTML files for pruned URLs ` +
    `(${missing} were already missing). Middleware will now apply 301 redirects.`,
);
