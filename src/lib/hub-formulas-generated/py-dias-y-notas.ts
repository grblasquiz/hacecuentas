import { compute as f1 } from '../formulas/dias-habiles-feriados-paraguay-2026';
import { compute as f2 } from '../formulas/promedio-notas-paraguay';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
};
