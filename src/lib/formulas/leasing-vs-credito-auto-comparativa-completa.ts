export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function leasingVsCreditoAutoComparativaCompleta(i: Inputs): Outputs {
  const v=Number(i.valorAuto)||0; const p=Number(i.plazoAnios)||1;
  const cuotaL=v*0.025; // 2.5% mensual en leasing típico
  const cuotaC=v*0.032; // crédito más caro
  const rec=v>30000?'Leasing si es uso empresa (deducible)':'Crédito suele ser mejor para persona física.';
  return { cuotaLeasing:`USD ${Math.round(cuotaL)}/mes + opción compra final`, cuotaCredito:`USD ${Math.round(cuotaC)}/mes (sos dueño al finalizar)`, recomendacion:rec };
}
