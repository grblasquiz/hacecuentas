/** Motor especializado para Comisiones de pasarelas México 2026. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['comisiones-pasarelas-pago-mexico-2026'](inputs);
}
