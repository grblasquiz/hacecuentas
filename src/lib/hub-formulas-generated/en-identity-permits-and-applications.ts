import { certificadoLibreDeudaAutoCosto as f1 } from '../formulas/certificado-libre-deuda-auto-costo';
import { licenciaConducirCostoCategoriaB1A as f2 } from '../formulas/licencia-conducir-costo-categoria-b1-a';
import { libretaSanitariaCostoHueriaFood as f3 } from '../formulas/libreta-sanitaria-costo-hueria-food';
import { dniExtranjeroResidenciaCostoMigraciones as f4 } from '../formulas/dni-extranjero-residencia-costo-migraciones';
import { cbcUbaMateriasRegularidadRequisitos as f5 } from '../formulas/cbc-uba-materias-regularidad-requisitos';
import { visaTurismoUsaEeUuCostoB1B2 as f6 } from '../formulas/visa-turismo-usa-ee-uu-costo-b1-b2';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
  c4: f4,
  c5: f5,
  c6: f6,
};
