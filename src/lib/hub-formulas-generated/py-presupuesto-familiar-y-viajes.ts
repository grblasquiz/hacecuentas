import { compute as f1 } from '../formulas/cuota-alimentaria-paraguay';
import { compute as f2 } from '../formulas/gasto-mensual-transporte-publico-paraguay';
import { compute as f3 } from '../formulas/presupuesto-viaje-mundial-2026-paraguay';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
};
