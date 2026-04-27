/**
 * Genera public/search-index.json — el dataset que /buscar levanta en cliente.
 *
 * Antes /buscar prerenderizaba 2.700+ cards en HTML (~2.4MB). Ahora la page
 * sirve solo el chrome (input + chips) y el cliente fetchea este JSON al
 * cargar. Brotli/gzip lo comprime a ~80-150KB transferidos.
 *
 * Keys cortas (s/h/d/c/i/a) para minimizar payload sin tocar la lógica de
 * filtrado en el cliente — un mapeo trivial.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CALCS_DIR = join(ROOT, 'src', 'content', 'calcs');
const PUBLIC_DIR = join(ROOT, 'public');

interface Entry {
  s: string;          // slug
  h: string;          // h1
  d: string;          // description
  c: string;          // category
  i: string;          // icon
  a?: 'AR';           // audience (solo si AR; default = global, ahorra bytes)
}

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
const entries: Entry[] = [];

for (const f of files) {
  try {
    const c = JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8'));
    if (!c.slug || !c.h1) continue;
    const e: Entry = {
      s: c.slug,
      h: c.h1,
      d: c.description ?? '',
      c: c.category ?? 'otros',
      i: c.icon ?? '🧮',
    };
    if (c.audience === 'AR') e.a = 'AR';
    entries.push(e);
  } catch {}
}

entries.sort((a, b) => a.h.localeCompare(b.h, 'es'));

writeFileSync(join(PUBLIC_DIR, 'search-index.json'), JSON.stringify(entries), 'utf8');
console.log(`✓ search-index.json → ${entries.length} entries`);
