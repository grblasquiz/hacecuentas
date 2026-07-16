/** Motor especializado para Crédito FOVISSSTE México 2026. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['credito-fovissste-mexico-2026'](inputs);
}
