/**
 * Patchea campos específicos dentro de un calc JSON preservando el resto del
 * archivo. Útil para actualizar presets o valores default.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src/content/calcs');

function findCalcFile(slug: string): string | null {
  const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
  for (const f of files) {
    const calc = JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8'));
    if (calc.slug === slug) return f;
  }
  return null;
}

/**
 * Reemplaza el array de presets completo. Si el calc no tiene presets, los crea.
 * Se usa para patchear valores tipo TNA de plazo fijo por banco.
 */
export function replacePresets(
  slug: string,
  title: string | undefined,
  items: Array<{ label: string; values: Record<string, string | number>; note?: string }>,
): boolean {
  const file = findCalcFile(slug);
  if (!file) return false;
  const full = join(CALCS_DIR, file);
  const calc = JSON.parse(readFileSync(full, 'utf8'));
  const oldPresets = JSON.stringify(calc.presets || null);
  calc.presets = { title, items };
  const newPresets = JSON.stringify(calc.presets);
  if (oldPresets === newPresets) return false; // no-op
  writeFileSync(full, JSON.stringify(calc, null, 2) + '\n', 'utf8');
  return true;
}

/**
 * Reemplaza el `default` de un field específico (por id). Usado para poner
 * el valor ICL o UVA actual como default del input correspondiente.
 */
export function updateFieldDefault(
  slug: string,
  fieldId: string,
  newDefault: string | number,
): boolean {
  const file = findCalcFile(slug);
  if (!file) return false;
  const full = join(CALCS_DIR, file);
  const calc = JSON.parse(readFileSync(full, 'utf8'));
  const field = (calc.fields || []).find((f: any) => f.id === fieldId);
  if (!field) return false;
  if (field.default === newDefault) return false; // no-op
  field.default = newDefault;
  writeFileSync(full, JSON.stringify(calc, null, 2) + '\n', 'utf8');
  return true;
}
