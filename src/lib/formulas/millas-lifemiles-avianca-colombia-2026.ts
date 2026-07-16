/** Motor especializado para Valor de millas LifeMiles Avianca. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['millas-lifemiles-avianca-colombia-2026'](inputs);
}
