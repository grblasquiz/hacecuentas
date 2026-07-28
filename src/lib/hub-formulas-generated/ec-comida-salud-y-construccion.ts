import { compute as f1 } from '../formulas/inta-calorias-diarias-chile';
import { compute as f2 } from '../formulas/costo-construccion-m2-ecuador';
import { compute as f3 } from '../formulas/conversion-medidas-cocina-tazas-gramos';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
};
