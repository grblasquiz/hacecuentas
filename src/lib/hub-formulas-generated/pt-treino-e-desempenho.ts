import { rmSentadillaEstimador as f1 } from '../formulas/1rm-sentadilla-estimador';
import { rmPesoMuertoEstimador as f2 } from '../formulas/1rm-peso-muerto-estimador';
import { rmPressBancaEstimador as f3 } from '../formulas/1rm-press-banca-estimador';
import { compute as f4 } from '../formulas/imc-tabela-oms-classificacao';
import { compute as f5 } from '../formulas/macros-emagrecimento-ganho-massa';
import { compute as f6 } from '../formulas/tmb-mifflin-st-jeor-portugues';
import { paceNatacion100mRitmo as f7 } from '../formulas/pace-natacion-100m-ritmo';
import { padelRankingPuntosAptAapSubir as f8 } from '../formulas/padel-ranking-puntos-apt-aap-subir';
import { proyeccion21kDesde10kCameron as f9 } from '../formulas/proyeccion-21k-desde-10k-cameron';
import { rugbyHandicapPuntosDescensoPromedio as f10 } from '../formulas/rugby-handicap-puntos-descenso-promedio';
import { trailRunningDesnivelRitmoAjustado as f11 } from '../formulas/trail-running-desnivel-ritmo-ajustado';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
  c4: f4,
  c5: f5,
  c6: f6,
  c7: f7,
  c8: f8,
  c9: f9,
  c10: f10,
  c11: f11,
};
