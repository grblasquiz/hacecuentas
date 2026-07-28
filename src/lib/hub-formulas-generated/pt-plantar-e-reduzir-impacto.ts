import { calendarioSiembraHemisferioSur as f1 } from '../formulas/calendario-siembra-hemisferio-sur';
import { cosechaEsperadaHuertaKg as f2 } from '../formulas/cosecha-esperada-huerta-kg';
import { huellaCarbonoBodaEvento as f3 } from '../formulas/huella-carbono-boda-evento';
import { podarRosalCuandoFecha as f4 } from '../formulas/podar-rosal-cuando-fecha';
import { biodegradacionResiduoTiempo as f5 } from '../formulas/biodegradacion-residuo-tiempo';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
  c4: f4,
  c5: f5,
};
