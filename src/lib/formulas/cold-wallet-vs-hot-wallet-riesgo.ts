export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function coldWalletVsHotWalletRiesgo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.montoTotalUsd)||0; const u=Number(i.usoFrequente)||1;
  const pctCold=Math.max(60, 100-u*5); const cold=m*pctCold/100; const hot=m-cold;
  const recomendacion = __lang === 'en'
    ? `Keep ${pctCold}% in cold wallet (Ledger/Trezor) and ${100-pctCold}% in hot for daily use.`
    : `Guardá ${pctCold}% en cold wallet (Ledger/Trezor) y ${100-pctCold}% en hot para uso diario.`;
  return { coldWalletRecomendado:`USD ${Math.round(cold).toLocaleString('en-US')}`, hotWalletRecomendado:`USD ${Math.round(hot).toLocaleString('en-US')}`, recomendacion };
}
