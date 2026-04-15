/**
 * Actualiza el campo lastUpdated en el bloque dataUpdate de un calc JSON.
 * Se llama al final de cada fetcher exitoso para marcar la calc como fresca.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src/content/calcs');

/** Busca el archivo JSON correspondiente al slug (porque filename ≠ slug). */
export function findCalcFile(slug: string): string | null {
  const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
  for (const f of files) {
    const calc = JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8'));
    if (calc.slug === slug) return f;
  }
  return null;
}

/** Marca lastUpdated del calc como la fecha dada (default: hoy). */
export function touchLastUpdated(slug: string, date: string = new Date().toISOString().slice(0, 10)): boolean {
  const file = findCalcFile(slug);
  if (!file) return false;
  const full = join(CALCS_DIR, file);
  const calc = JSON.parse(readFileSync(full, 'utf8'));
  if (!calc.dataUpdate) return false;
  if (calc.dataUpdate.lastUpdated === date) return false; // no-op
  calc.dataUpdate.lastUpdated = date;
  writeFileSync(full, JSON.stringify(calc, null, 2) + '\n', 'utf8');
  return true;
}
