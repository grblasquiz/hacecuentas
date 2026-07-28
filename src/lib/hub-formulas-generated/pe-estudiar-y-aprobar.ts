import { compute as f1 } from '../formulas/costo-universidad-privada-peru';
import { compute as f2 } from '../formulas/promedio-ponderado-universidad-peru';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
};
