/** YT Premium split */
export interface YoutubePremiumSplitPayoutInputs { vistasMensuales: number; pctPremium: number; rpmPremium: number; }
export interface YoutubePremiumSplitPayoutOutputs { vistasPremium: number; ingresoPremium: number; pctRevenueTotal: number; _insight?: any; _chart?: any; }
export function youtubePremiumSplitPayout(i: YoutubePremiumSplitPayoutInputs): YoutubePremiumSplitPayoutOutputs {
  const v=Number(i.vistasMensuales), p=Number(i.pctPremium), r=Number(i.rpmPremium);
  if (!v || v<=0) throw new Error('Vistas invalidas');
  if (p<0 || p>100) throw new Error('% Premium entre 0 y 100');
  if (r<=0) throw new Error('RPM invalido');
  const vp = v * (p/100), ing = (vp/1000)*r;
  // Estimacion simple: Premium RPM 2.5x, ads RPM ~4 USD
  const ingAds = ((v - vp)/1000)*4;
  const ingTotalAprox = ing + ingAds;
  const pctRev = ingTotalAprox > 0 ? (ing / ingTotalAprox) * 100 : 0;
  const tone = pctRev >= 25 ? 'good' : 'neutral';
  const _insight = {
    title: 'Cuánto pesa YouTube Premium',
    text: `De tus **${v.toLocaleString('es-AR')}** vistas, **${Math.round(vp).toLocaleString('es-AR')}** (**${p}%**) vienen de usuarios Premium y rinden **USD ${ing.toFixed(2)}** a RPM ${r}. Eso representa ~**${pctRev.toFixed(1)}%** de tu ingreso estimado total (USD ${ingTotalAprox.toFixed(2)}): el público Premido paga sin ver anuncios, así que es ingreso ${pctRev >= 25 ? 'muy valioso' : 'complementario'}.`,
    tone: tone as 'good' | 'neutral',
    icon: '⭐',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Premium', value: +ing.toFixed(2) },
      { label: 'Ads (no Premium)', value: +ingAds.toFixed(2) },
    ],
    prefix: 'USD ',
    centerValue: `USD ${ingTotalAprox.toFixed(2)}`,
    centerLabel: 'Total est.',
    ariaLabel: `Ingreso total estimado de USD ${ingTotalAprox.toFixed(2)} dividido entre Premium y anuncios`,
  };
  return { vistasPremium: Math.round(vp), ingresoPremium:+ing.toFixed(2), pctRevenueTotal:+pctRev.toFixed(1), _insight, _chart };
}
