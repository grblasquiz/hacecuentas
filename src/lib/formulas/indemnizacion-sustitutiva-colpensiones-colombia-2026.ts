/** Motor especializado para Indemnización sustitutiva Colpensiones. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['indemnizacion-sustitutiva-colpensiones-colombia-2026'](inputs);
}
