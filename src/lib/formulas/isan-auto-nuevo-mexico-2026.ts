/** Motor especializado para ISAN auto nuevo México 2026. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['isan-auto-nuevo-mexico-2026'](inputs);
}
