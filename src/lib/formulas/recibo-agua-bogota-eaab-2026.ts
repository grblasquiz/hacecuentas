/** Motor especializado para Recibo de agua Bogotá EAAB 2026. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['recibo-agua-bogota-eaab-2026'](inputs);
}
