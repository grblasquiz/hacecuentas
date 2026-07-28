import { compute as f1 } from '../formulas/hora-fin-programa-rcn';
import { compute as f2 } from '../formulas/impuestos-aerolineas-tasa-aeropuerto-colombia-internacional';
import { compute as f3 } from '../formulas/millas-lifemiles-avianca-colombia-2026';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
};
