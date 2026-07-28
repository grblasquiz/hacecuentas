import { compute as f1 } from '../formulas/calculadora-cuota-credito-hipotecario-ui-uruguay';
import { compute as f2 } from '../formulas/calculadora-cuota-prestamo-uruguay';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
};
