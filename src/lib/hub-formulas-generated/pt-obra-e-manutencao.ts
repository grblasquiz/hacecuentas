import { aceroKgM2Losa as f1 } from '../formulas/acero-kg-m2-losa';
import { calderaKwM2Calefaccion as f2 } from '../formulas/caldera-kw-m2-calefaccion';
import { compute as f3 } from '../formulas/custo-obra-por-m2-quanto-custa-construir-casa-cub';
import { drenajeGravaMaceta as f4 } from '../formulas/drenaje-grava-maceta';
import { mudanzaCostoFleteCamionetaKmCaja as f5 } from '../formulas/mudanza-costo-flete-camioneta-km-caja';
import { mulchingEspesorCantidad as f6 } from '../formulas/mulching-espesor-cantidad';
import { paredLadrillosMetrosM2 as f7 } from '../formulas/pared-ladrillos-metros-m2';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
  c4: f4,
  c5: f5,
  c6: f6,
  c7: f7,
};
