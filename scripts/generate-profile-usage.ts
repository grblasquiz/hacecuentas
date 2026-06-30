/**
 * Genera src/lib/profile/usage-auto.json: índice inverso de qué calculadoras
 * usan cada clave canónica del perfil (profileKey).
 *
 *   { "trabajo.sueldoBruto": [{ "slug": "...", "title": "..." }, ...], ... }
 *
 * Lo consume /mi-hacecuentas para mostrar, junto a cada dato del perfil, las
 * calculadoras que se precargan con él (cierra el loop de reúso cross-tool).
 *
 * Escanea los JSON de calcs (AR) buscando recursivamente cualquier "profileKey".
 * Rápido (fs-only) y determinista (orden alfabético por título).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = 'src/content/calcs';
const OUT = 'src/lib/profile/usage-auto.json';

/** Junta todos los valores de "profileKey" que aparezcan en el objeto. */
function collectProfileKeys(node: unknown, out: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) collectProfileKeys(item, out);
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (k === 'profileKey' && typeof v === 'string') out.add(v);
      else collectProfileKeys(v, out);
    }
  }
}

function main(): void {
  const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
  const index: Record<string, { slug: string; title: string }[]> = {};

  for (const file of files) {
    let calc: { slug?: string; title?: string } & Record<string, unknown>;
    try {
      calc = JSON.parse(readFileSync(join(CALCS_DIR, file), 'utf8'));
    } catch {
      continue;
    }
    if (!calc.slug) continue;
    const keys = new Set<string>();
    collectProfileKeys(calc, keys);
    if (keys.size === 0) continue;
    // Título corto: cortar en ":" o "—" para no arrastrar el SEO completo.
    const title = (calc.title || calc.slug).split(/[:—|(]/)[0].trim();
    for (const key of keys) {
      (index[key] ||= []).push({ slug: calc.slug, title });
    }
  }

  // Orden estable por título dentro de cada clave.
  for (const key of Object.keys(index)) {
    index[key].sort((a, b) => a.title.localeCompare(b.title, 'es'));
  }

  writeFileSync(OUT, JSON.stringify(index, null, 2) + '\n');
  const total = Object.values(index).reduce((n, arr) => n + arr.length, 0);
  console.log(`profile-usage: ${Object.keys(index).length} claves, ${total} usos → ${OUT}`);
}

main();
