import { appsIdiomaEfectividadComparacionNivel as f1 } from '../formulas/apps-idioma-efectividad-comparacion-nivel';
import { clasesSemanalesItalkiOnlineFrecuencia as f2 } from '../formulas/clases-semanales-italki-online-frecuencia';
import { cbcUbaMateriasRegularidadRequisitos as f3 } from '../formulas/cbc-uba-materias-regularidad-requisitos';
import { notaPromedioBachilleratoSecundarioMaterias as f4 } from '../formulas/nota-promedio-bachillerato-secundario-materias';
import { compute as f5 } from '../formulas/media-para-passar-recuperacao-nota-necessaria';
import { compute as f6 } from '../formulas/media-ponderada-enem-nota-corte-sisu';
import { podcastsAprenderIdiomaMinutosDiarios as f7 } from '../formulas/podcasts-aprender-idioma-minutos-diarios';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
  c4: f4,
  c5: f5,
  c6: f6,
  c7: f7,
};
