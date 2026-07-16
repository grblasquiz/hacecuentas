/** Motor especializado para Gastos de escrituración e ISAI México. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['gastos-escrituracion-isai-mexico-2026'](inputs);
}
