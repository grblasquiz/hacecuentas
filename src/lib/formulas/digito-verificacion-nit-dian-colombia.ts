/** Motor especializado para Dígito de verificación NIT DIAN. */
import { engines } from './_mx-co-gap-engines.ts';

export function compute(inputs: Record<string, any>): Record<string, any> {
  return engines['digito-verificacion-nit-dian-colombia'](inputs);
}
