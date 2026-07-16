/** Motor especializado para Fondo de ahorro y vales México 2026. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['fondo-ahorro-vales-despensa-mexico-2026'](inputs);
}
