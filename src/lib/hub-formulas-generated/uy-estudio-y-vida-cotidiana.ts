import { edadPerroHumanoRazaTamano as f1 } from '../formulas/edad-perro-humano-raza-tamano';
import { compute as f2 } from '../formulas/calculadora-promedio-escolaridad-udelar-uruguay';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
};
