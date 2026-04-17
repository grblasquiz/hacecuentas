/** YT Premium split */
export interface YoutubePremiumSplitPayoutInputs { vistasMensuales: number; pctPremium: number; rpmPremium: number; }
export interface YoutubePremiumSplitPayoutOutputs { vistasPremium: number; ingresoPremium: number; pctRevenueTotal: number; }
export function youtubePremiumSplitPayout(i: YoutubePremiumSplitPayoutInputs): YoutubePremiumSplitPayoutOutputs {
  const v=Number(i.vistasMensuales), p=Number(i.pctPremium), r=Number(i.rpmPremium);
  if (!v || v<=0) throw new Error('Vistas invalidas');
  if (p<0 || p>100) throw new Error('% Premium entre 0 y 100');
  if (r<=0) throw new Error('RPM invalido');
  const vp = v * (p/100), ing = (vp/1000)*r;
  // Estimacion simple: Premium RPM 2.5x, ads RPM ~4 USD
  const ingTotalAprox = ing + ((v - vp)/1000)*4;
  const pctRev = ingTotalAprox > 0 ? (ing / ingTotalAprox) * 100 : 0;
  return { vistasPremium: Math.round(vp), ingresoPremium:+ing.toFixed(2), pctRevenueTotal:+pctRev.toFixed(1) };
}
