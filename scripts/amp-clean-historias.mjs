// Post-build: deja válido el AMP de las Web Stories (dist/client/historias/*.html).
// Astro inyecta en TODA página un <script type="module" src="/_astro/page.*.js">
// (shim global) + a veces un modulepreload, y serializa los booleanos como
// standalone="true". AMP prohíbe JS propio y quiere `standalone` sin valor → esto
// rompe la validación. No hay forma per-page de excluir el inject del pipeline,
// así que limpiamos el output. Determinístico: solo toca /historias/*.html.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'dist', 'client', 'historias');

if (!existsSync(DIR)) {
  console.log('[amp-clean] dist/client/historias no existe — skip');
  process.exit(0);
}

let cleaned = 0;
for (const f of readdirSync(DIR)) {
  if (!f.endsWith('.html')) continue;
  const p = join(DIR, f);
  let html = readFileSync(p, 'utf8');
  const before = html;
  html = html
    .replace(/<script[^>]*\btype="module"[^>]*><\/script>/g, '')   // shim JS inyectado
    .replace(/<link[^>]*\brel="modulepreload"[^>]*>/g, '')          // su modulepreload
    .replace(/\bstandalone="true"/g, 'standalone');                 // booleano AMP
  if (html !== before) { writeFileSync(p, html); cleaned++; }
}
console.log(`[amp-clean] ${cleaned} Web Stories AMP limpiadas en dist/client/historias`);
