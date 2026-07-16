/** Motor especializado para Paneles solares y ahorro CFE México. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['paneles-solares-ahorro-cfe-mexico'](inputs);
}
