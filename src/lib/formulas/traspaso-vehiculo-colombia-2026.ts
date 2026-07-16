/** Motor especializado para Traspaso de vehículo Colombia 2026. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['traspaso-vehiculo-colombia-2026'](inputs);
}
