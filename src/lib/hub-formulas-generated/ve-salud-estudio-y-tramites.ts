import { caloriasTDEE as f1 } from '../formulas/calorias-tdee';
import { compute as f2 } from '../formulas/costo-pasaporte-saime-venezuela';
import { compute as f3 } from '../formulas/calculadora-promedio-notas-20-puntos-venezuela';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
};
