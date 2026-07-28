import { compute as f1 } from '../formulas/costo-pasaporte-colombia-2026';
import { compute as f2 } from '../formulas/curp-colombia-cedula-ciudadania-extranjeria-validez';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
};
