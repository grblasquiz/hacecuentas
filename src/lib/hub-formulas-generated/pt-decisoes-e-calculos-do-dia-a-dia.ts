import { dashHipertensionSodioDiarioTabla as f1 } from '../formulas/dash-hipertension-sodio-diario-tabla';
import { eloAjedrezGanadoPerdidoVariacion as f2 } from '../formulas/elo-ajedrez-ganado-perdido-variacion';
import { veganaProteinaCompletaCombinacionAminoacidos as f3 } from '../formulas/vegana-proteina-completa-combinacion-aminoacidos';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
};
