/** Motor especializado para Peajes y combustible por ruta Colombia. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['peajes-combustible-ruta-colombia-2026'](inputs);
}
