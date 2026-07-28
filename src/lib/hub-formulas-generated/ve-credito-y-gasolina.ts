import { compute as f1 } from '../formulas/calculadora-credito-nomina-bdv-venezuela';
import { calculadoraCupoGasolinaSubsidiadaVenezuela as f2 } from '../formulas/calculadora-cupo-gasolina-subsidiada-venezuela';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
};
