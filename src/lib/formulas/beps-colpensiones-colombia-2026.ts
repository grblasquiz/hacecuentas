/** Motor especializado para BEPS Colpensiones Colombia 2026. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['beps-colpensiones-colombia-2026'](inputs);
}
