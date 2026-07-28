import { compute as f1 } from '../formulas/compras-exterior-courier-uruguay';
import { compute as f2 } from '../formulas/calculadora-factura-ute-consumo-electrico-uruguay';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
};
