/** Motor especializado para Cambio de propietario y refrendo México. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['cambio-propietario-refrendo-vehicular-mexico-2026'](inputs);
}
