import { compute as f1 } from '../formulas/calculadora-costo-viaje-nafta-uruguay';
import { compute as f2 } from '../formulas/patente-rodados-uruguay';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
};
