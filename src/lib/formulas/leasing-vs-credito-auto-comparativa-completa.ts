export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function leasingVsCreditoAutoComparativaCompleta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v=Number(i.valorAuto)||0; const p=Number(i.plazoAnios)||1;
  const cuotaL=v*0.025; // 2.5% mensual en leasing típico
  const cuotaC=v*0.032; // crédito más caro
  const rec=v>30000
    ? (__lang === 'en' ? 'Leasing is better for business use (tax deductible)' : 'Leasing si es uso empresa (deducible)')
    : (__lang === 'en' ? 'A loan is usually better for individuals.' : 'Crédito suele ser mejor para persona física.');
  return {
    cuotaLeasing: __lang === 'en' ? `USD ${Math.round(cuotaL)}/mo + final purchase option` : `USD ${Math.round(cuotaL)}/mes + opción compra final`,
    cuotaCredito: __lang === 'en' ? `USD ${Math.round(cuotaC)}/mo (you own it at the end)` : `USD ${Math.round(cuotaC)}/mes (sos dueño al finalizar)`,
    recomendacion: rec
  };
}
