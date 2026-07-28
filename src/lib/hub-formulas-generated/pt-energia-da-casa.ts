import { consumoHeladeraAnualKwh as f1 } from '../formulas/consumo-heladera-anual-kwh';
import { compute as f2 } from '../formulas/conta-de-luz-kwh-bandeira-tarifaria';
import { energiaElectrodomesticoEtiquetaEficiencia as f3 } from '../formulas/energia-electrodomestico-etiqueta-eficiencia';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
};
