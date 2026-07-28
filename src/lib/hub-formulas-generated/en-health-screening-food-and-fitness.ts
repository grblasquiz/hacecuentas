import { alcoholSangreBac as f1 } from '../formulas/alcohol-sangre-bac';
import { grasaCorporalPliegues as f2 } from '../formulas/grasa-corporal-pliegues';
import { boxeoCaloriasQuemadasRoundsPeso as f3 } from '../formulas/boxeo-calorias-quemadas-rounds-peso';
import { burnoutIndiceCargaLaboralTestMbi as f4 } from '../formulas/burnout-indice-carga-laboral-test-mbi';
import { celiacoGlutenAlimentosPpmSinTacc as f5 } from '../formulas/celiaco-gluten-alimentos-ppm-sin-tacc';
import { pesoObjetivoCompeticion as f6 } from '../formulas/peso-objetivo-competicion';
import { veganaProteinaCompletaCombinacionAminoacidos as f7 } from '../formulas/vegana-proteina-completa-combinacion-aminoacidos';
import { certificadoAntecedentesPenalesCosto as f8 } from '../formulas/certificado-antecedentes-penales-costo';
import { fodmapAlimentosIntoleranciaSiiTabla as f9 } from '../formulas/fodmap-alimentos-intolerancia-sii-tabla';
import { pHAlimentoAlcalinidad as f10 } from '../formulas/pH-alimento-alcalinidad';
import { ketoMacrosCetogenicaDeficitCompleto as f11 } from '../formulas/keto-macros-cetogenica-deficit-completo';
import { calidadSuenoPittsburgh as f12 } from '../formulas/calidad-sueno-pittsburgh';
import { depresionPospartoTest as f13 } from '../formulas/depresion-posparto-test';
import { acidezOrinaAlimentos as f14 } from '../formulas/acidez-orina-alimentos';
import { spfProteccionSolarMinutosPiel as f15 } from '../formulas/spf-proteccion-solar-minutos-piel';
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
  c12: f12,
  c13: f13,
  c14: f14,
  c15: f15,
};
