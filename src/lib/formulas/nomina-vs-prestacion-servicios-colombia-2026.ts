/** Motor especializado para Nómina vs prestación de servicios Colombia. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['nomina-vs-prestacion-servicios-colombia-2026'](inputs);
}
