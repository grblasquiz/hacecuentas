/**
 * Genera src/lib/og-manifest.json con todas las slugs que tienen OG image.
 *
 * El frontmatter de [...slug].astro corre en el runtime Cloudflare Workers
 * cuando el sitio usa output:'server', y ese runtime NO tiene `node:fs`.
 * Por eso no podemos verificar existencia del PNG directamente desde la
 * página — hay que pre-computar un manifest en un script Node puro y que
 * la página lo importe al bundle.
 *
 * Formato: { "calculadora-aguinaldo-sac": true, "calculadora-imc": true, ... }
 * Tamaño típico ~90 KB para 2700+ slugs (se incluye en el Worker bundle).
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OG_DIR = join(ROOT, 'public', 'og');
const OUT_PATH = join(ROOT, 'src', 'lib', 'og-manifest.json');

const manifest: Record<string, true> = {};
for (const file of readdirSync(OG_DIR)) {
  if (file.endsWith('.png')) {
    manifest[file.replace(/\.png$/, '')] = true;
  }
}
writeFileSync(OUT_PATH, JSON.stringify(manifest));
console.log(`OG manifest: ${Object.keys(manifest).length} slugs → ${OUT_PATH}`);
