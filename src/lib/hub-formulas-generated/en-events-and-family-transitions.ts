import { divorcioLiquidacionBienesGanancialesCosto as f1 } from '../formulas/divorcio-liquidacion-bienes-gananciales-costo';
import { tallaAnilloDedo as f2 } from '../formulas/talla-anillo-dedo';
import { etapasDueloPerdidaFamiliarMeses as f3 } from '../formulas/etapas-duelo-perdida-familiar-meses';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
};
