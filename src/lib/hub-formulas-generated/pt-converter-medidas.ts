import { conversionMedidaNeumaticoRadioDiametro as f1 } from '../formulas/conversion-medida-neumatico-radio-diametro';
import { conversionQuintalToneladaKgAgro as f2 } from '../formulas/conversion-quintal-tonelada-kg-agro';
import { conversionTorqueNmLbFtKgm as f3 } from '../formulas/conversion-torque-nm-lb-ft-kgm';
import { conversionVelocidadKmhMphNudos as f4 } from '../formulas/conversion-velocidad-kmh-mph-nudos';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
  c4: f4,
};
