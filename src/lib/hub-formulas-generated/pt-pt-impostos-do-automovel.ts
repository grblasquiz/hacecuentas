import { compute as f1 } from '../formulas/calculadora-isv-importacao-carro-portugal';
import { calculadoraIucPortugal as f2 } from '../formulas/calculadora-iuc-portugal';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
};
