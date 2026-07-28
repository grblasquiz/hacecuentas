import { compute as f1 } from '../formulas/impuestos-importacion-vehiculo-republica-dominicana';
import { compute as f2 } from '../formulas/prestamo-vehiculo-cuota-republica-dominicana';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
};
