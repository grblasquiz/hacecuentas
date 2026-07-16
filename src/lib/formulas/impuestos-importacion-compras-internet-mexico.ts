/** Motor especializado para Impuestos de compras por internet México. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['impuestos-importacion-compras-internet-mexico'](inputs);
}
