export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function coldWalletVsHotWalletRiesgo(i: Inputs): Outputs {
  const m=Number(i.montoTotalUsd)||0; const u=Number(i.usoFrequente)||1;
  const pctCold=Math.max(60, 100-u*5); const cold=m*pctCold/100; const hot=m-cold;
  return { coldWalletRecomendado:`USD ${Math.round(cold).toLocaleString('en-US')}`, hotWalletRecomendado:`USD ${Math.round(hot).toLocaleString('en-US')}`, recomendacion:`Guardá ${pctCold}% en cold wallet (Ledger/Trezor) y ${100-pctCold}% en hot para uso diario.` };
}
