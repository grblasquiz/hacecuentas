/** Motor especializado para Costo de vender online Colombia 2026. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['costo-vender-online-colombia-2026'](inputs);
}
