export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function coldWalletVsHotWalletRiesgo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.montoTotalUsd)||0; const u=Number(i.usoFrequente)||1;
  const pctCold=Math.max(60, 100-u*5); const cold=m*pctCold/100; const hot=m-cold;
  const recomendacion = __lang === 'en'
    ? `Keep ${pctCold}% in cold wallet (Ledger/Trezor) and ${100-pctCold}% in hot for daily use.`
    : `Guardá ${pctCold}% en cold wallet (Ledger/Trezor) y ${100-pctCold}% en hot para uso diario.`;
  const coldFmt = Math.round(cold).toLocaleString('en-US');
  const hotFmt = Math.round(hot).toLocaleString('en-US');
  const pctHot = 100 - pctCold;
  const _insight = {
    title: __lang === 'en' ? 'Most of it goes cold' : 'La mayor parte, en frío',
    text: __lang === 'en'
      ? `With **USD ${m.toLocaleString('en-US')}** and that usage level, **${pctCold}%** (USD ${coldFmt}) belongs offline in cold storage and only **USD ${hotFmt}** stays hot for spending. The hot wallet is your attack surface — never park more than you'd accept losing.`
      : `Con **USD ${m.toLocaleString('en-US')}** y ese nivel de uso, el **${pctCold}%** (USD ${coldFmt}) va offline en cold storage y solo **USD ${hotFmt}** queda en hot para operar. La hot wallet es tu superficie de ataque: nunca dejes ahí más de lo que aceptarías perder.`,
    tone: 'warn',
    icon: '🔐',
  };
  const _chart = m > 0 ? {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Cold wallet' : 'Cold wallet', value: Math.round(cold) },
      { label: __lang === 'en' ? 'Hot wallet' : 'Hot wallet', value: Math.round(hot) },
    ],
    prefix: '$',
    centerValue: `$${Math.round(m).toLocaleString('en-US')}`,
    centerLabel: __lang === 'en' ? 'Total' : 'Total',
    ariaLabel: __lang === 'en'
      ? `${pctCold}% in cold wallet, ${pctHot}% in hot wallet`
      : `${pctCold}% en cold wallet, ${pctHot}% en hot wallet`,
  } : undefined;
  return { coldWalletRecomendado:`USD ${coldFmt}`, hotWalletRecomendado:`USD ${hotFmt}`, recomendacion, _insight, _chart };
}
