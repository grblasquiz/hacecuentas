/**
 * generate-hreflang-index.ts
 *
 * Emite src/lib/hreflang-index.json: por cada locale secundario (en/pt/mx/es/
 * co/cl) un array slim { slug, esSlug } — los ÚNICOS dos campos que
 * src/pages/[...slug].astro necesita para construir los <link hreflang>.
 *
 * Por qué: antes [...slug].astro hacía import.meta.glob({eager:true}) de los 6
 * dirs de locales (~1200 JSON enteros con intro/faqs/explanation) solo para
 * leer .slug/.esSlug en el bloque hreflang. Eso infla el grafo de build y la
 * memoria del prerender (riesgo de OOM en CI al escalar). Este índice slim
 * reemplaza esos globs por un solo import chico, sin cambiar el matching.
 *
 * Corre en prebuild (fase 2). Idempotente.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const OUT = join(ROOT, 'src/lib/hreflang-index.json');

// locale → directorio de contenido. Mismo set que [...slug].astro.
const LOCALES: Record<string, string> = {
  en: 'calcs-en',
  pt: 'calcs-pt',
  mx: 'calcs-mx',
  es: 'calcs-es',
  co: 'calcs-co',
  cl: 'calcs-cl',
};

type SlimCalc = { slug: string; esSlug?: string };

function slimLocale(dir: string): SlimCalc[] {
  const full = join(CONTENT, dir);
  let files: string[];
  try {
    files = readdirSync(full).filter((f) => f.endsWith('.json'));
  } catch {
    return []; // dir ausente → array vacío (locale sin calcs)
  }
  const out: SlimCalc[] = [];
  for (const f of files) {
    try {
      const j = JSON.parse(readFileSync(join(full, f), 'utf8'));
      if (!j || typeof j.slug !== 'string') continue;
      const entry: SlimCalc = { slug: j.slug };
      if (typeof j.esSlug === 'string') entry.esSlug = j.esSlug;
      out.push(entry);
    } catch {
      // JSON inválido — lo agarra la validación Zod del build; acá lo salteamos
    }
  }
  // Orden estable para diffs limpios
  out.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  return out;
}

const index: Record<string, SlimCalc[]> = {};
let total = 0;
for (const [locale, dir] of Object.entries(LOCALES)) {
  index[locale] = slimLocale(dir);
  total += index[locale].length;
}

writeFileSync(OUT, JSON.stringify(index) + '\n', 'utf8');
const counts = Object.entries(index).map(([k, v]) => `${k}=${v.length}`).join(' ');
console.log(`[generate-hreflang-index] ✓ ${total} entradas (${counts})`);
