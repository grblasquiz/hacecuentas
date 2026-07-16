/** Motor especializado para Importar auto de Estados Unidos a México. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['importacion-auto-estados-unidos-mexico-2026'](inputs);
}
