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

/**
 * Como findCalcFile pero devuelve la RUTA COMPLETA y también busca en los
 * directorios país (src/content/calcs-pe, calcs-co, …). El validador de stale
 * ya es multi-dir; los patchers eran ciegos a los calcs país.
 */
export function findCalcPath(slug: string): string | null {
  const contentDir = join(process.cwd(), 'src/content');
  const dirs = readdirSync(contentDir).filter((d) => d === 'calcs' || d.startsWith('calcs-'));
  for (const dir of dirs) {
    const dirFull = join(contentDir, dir);
    for (const f of readdirSync(dirFull).filter((x) => x.endsWith('.json'))) {
      try {
        const calc = JSON.parse(readFileSync(join(dirFull, f), 'utf8'));
        if (calc.slug === slug) return join(dirFull, f);
      } catch {
        /* JSON roto: lo ignora, no es asunto de este patcher */
      }
    }
  }
  return null;
}

/** Marca lastUpdated del calc como la fecha dada (default: hoy). Multi-dir. */
export function touchLastUpdated(slug: string, date: string = new Date().toISOString().slice(0, 10)): boolean {
  const full = findCalcPath(slug);
  if (!full) return false;
  const calc = JSON.parse(readFileSync(full, 'utf8'));
  if (!calc.dataUpdate) return false;
  if (calc.dataUpdate.lastUpdated === date) return false; // no-op
  calc.dataUpdate.lastUpdated = date;
  writeFileSync(full, JSON.stringify(calc, null, 2) + '\n', 'utf8');
  return true;
}
