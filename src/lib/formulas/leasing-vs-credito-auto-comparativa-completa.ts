export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function leasingVsCreditoAutoComparativaCompleta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v=Number(i.valorAuto)||0; const p=Number(i.plazoAnios)||1;
  const cuotaL=v*0.025; // 2.5% mensual en leasing típico
  const cuotaC=v*0.032; // crédito más caro
  const rec=v>30000
    ? (__lang === 'en' ? 'Leasing is better for business use (tax deductible)' : __lang === 'pt' ? 'Leasing é melhor para uso empresarial (dedutível)' : 'Leasing si es uso empresa (deducible)')
    : (__lang === 'en' ? 'A loan is usually better for individuals.' : __lang === 'pt' ? 'O financiamento costuma ser melhor para pessoa física.' : 'Crédito suele ser mejor para persona física.');
  const difMes=Math.round(cuotaC-cuotaL);
  const insightText = __lang === 'en'
    ? `Leasing runs about **USD ${Math.round(cuotaL)}/mo** versus **USD ${Math.round(cuotaC)}/mo** for the loan — roughly **USD ${difMes}/mo cheaper**, but you don't own the car unless you exercise the final purchase option.`
    : __lang === 'pt'
    ? `O leasing fica em cerca de **USD ${Math.round(cuotaL)}/mês** contra **USD ${Math.round(cuotaC)}/mês** do financiamento — uns **USD ${difMes}/mês mais barato**, mas você não é dono salvo que exerça a opção de compra final.`
    : `El leasing ronda los **USD ${Math.round(cuotaL)}/mes** contra **USD ${Math.round(cuotaC)}/mes** del crédito — unos **USD ${difMes}/mes más barato**, pero no sos dueño salvo que ejerzas la opción de compra final.`;
  const insightTitle = __lang === 'en' ? 'Leasing vs loan, monthly' : __lang === 'pt' ? 'Leasing vs financiamento, mensal' : 'Leasing vs crédito, por mes';
  return {
    cuotaLeasing: __lang === 'en' ? `USD ${Math.round(cuotaL)}/mo + final purchase option` : __lang === 'pt' ? `USD ${Math.round(cuotaL)}/mês + opção de compra final` : `USD ${Math.round(cuotaL)}/mes + opción compra final`,
    cuotaCredito: __lang === 'en' ? `USD ${Math.round(cuotaC)}/mo (you own it at the end)` : __lang === 'pt' ? `USD ${Math.round(cuotaC)}/mês (você é o dono ao final)` : `USD ${Math.round(cuotaC)}/mes (sos dueño al finalizar)`,
    recomendacion: rec,
    _insight: {
      title: insightTitle,
      text: insightText,
      tone: 'neutral',
      icon: '🚗',
    },
  };
}
