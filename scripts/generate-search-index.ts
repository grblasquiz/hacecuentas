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
import { DECISION_MANIFEST } from '../src/lib/decisions/manifest.ts';
import { DECISION_MANIFEST_LOCALES } from '../src/lib/decisions/manifest-locales.ts';
import { canDistributeCalc } from '../src/lib/content-policy.ts';

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
  a?: string;         // audience (AR, ES, MX, CO, CL, BO, PE, global...) — necesario para
                      // el ranking +30/-20 por país en el modal del Header.
}

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
const entries: Entry[] = [];

for (const f of files) {
  try {
    const c = JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8'));
    // Excluir noindex/restringidas: si Google no las indexa, tampoco deberían
    // aparecer en el buscador interno. canDistributeCalc cubre noindex manual +
    // restricción YMYL (ymylRisk:high sin revisor / distribution:restricted).
    if (!c.slug || !c.h1 || !canDistributeCalc(c)) continue;
    const e: Entry = {
      s: c.slug,
      h: c.h1,
      d: c.description ?? '',
      c: c.category ?? 'otros',
      i: c.icon ?? '🧮',
    };
    // Preservamos cualquier audience seteado, no sólo 'AR'. El Header modal compara
    // c.a contra el path actual (preferredAudience) para boostear (+30) calcs locales
    // y penalizar (-20) calcs de otros países.
    if (c.audience) e.a = c.audience;
    entries.push(e);
  } catch {}
}

// Desde la consolidación de julio de 2026 `src/content/calcs` quedó vacío:
// las herramientas canónicas viven en hubs y su snapshot está en
// current-tools-index.json. Si sólo leyéramos el directorio legacy, el índice
// interno quedaría reducido a las salas /decidir y todos los buscadores
// parecerían no encontrar nada.
try {
  const currentTools = JSON.parse(
    readFileSync(join(ROOT, 'src', 'lib', 'current-tools-index.json'), 'utf8'),
  );
  if (Array.isArray(currentTools)) {
    for (const tool of currentTools) {
      if (!tool?.slug || !(tool.h1 || tool.title)) continue;
      const locale = String(tool.locale || '').toLowerCase();
      const audience = tool.audience
        || ({ es: 'ES', mx: 'MX', co: 'CO', cl: 'CL', pe: 'PE', ec: 'EC',
              ve: 'VE', py: 'PY', uy: 'UY', do: 'DO', pt: 'BR', 'pt-pt': 'PT',
              en: 'EN' } as Record<string, string>)[locale]
        || 'AR';
      entries.push({
        s: String(tool.slug).replace(/^\/+/, ''),
        h: String(tool.h1 || tool.title),
        d: String(tool.description || ''),
        c: String(tool.category || 'otros'),
        i: String(tool.icon || '🧮'),
        a: audience,
      });
    }
  }
} catch {
  // El gate de tamaño de abajo hace visible cualquier snapshot faltante.
}

// Salas de decisión (/decidir/*): descubribles desde el buscador interno y
// desde los consumidores del índice (bot X, backlink bot). El slug lleva el
// path completo porque los consumidores arman la URL como `/${s}`.
for (const r of DECISION_MANIFEST) {
  entries.push({ s: `decidir/${r.slug}`, h: r.h1, d: r.description, c: 'decidir', i: r.icon, a: 'AR' });
}
for (const r of DECISION_MANIFEST_LOCALES) {
  entries.push({
    s: `${r.country}/decidir/${r.slug}`, h: r.h1, d: r.description,
    c: 'decidir', i: r.icon, a: r.country.toUpperCase(),
  });
}

const uniqueEntries = [...new Map(entries.map((entry) => [entry.s, entry])).values()];
uniqueEntries.sort((a, b) => a.h.localeCompare(b.h, 'es'));

if (uniqueEntries.length < 500) {
  throw new Error(`search-index.json incompleto: ${uniqueEntries.length} entries (mínimo esperado: 500)`);
}

writeFileSync(join(PUBLIC_DIR, 'search-index.json'), JSON.stringify(uniqueEntries), 'utf8');
console.log(`✓ search-index.json → ${uniqueEntries.length} entries`);
