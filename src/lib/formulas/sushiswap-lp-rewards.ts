/** Sushiswap LP + SUSHI rewards */
export interface Inputs { lpUsd: number; poolApr: number; sushiApr: number; boostMultiplier: number; months: number; ilPercent: number; }
export interface Outputs { totalApy: number; sushiRewards: number; feesEarned: number; ilLoss: number; netReturn: number; explicacion: string; _chart?: any; _insight?: any; }
export function sushiswapLpRewards(i: Inputs): Outputs {
  const lp = Number(i.lpUsd);
  const pool = Number(i.poolApr) / 100;
  const sushi = Number(i.sushiApr) / 100;
  const boost = Number(i.boostMultiplier) || 1;
  const months = Number(i.months) || 12;
  const il = Number(i.ilPercent) / 100;
  if (!lp || lp <= 0) throw new Error('Ingresá LP USD');
  const years = months / 12;
  const fees = lp * pool * years;
  const sushiRewards = lp * sushi * boost * years;
  const ilLoss = lp * il;
  const net = fees + sushiRewards - ilLoss;
  const totalApy = (pool + sushi * boost) * 100;
  const grossReward = fees + sushiRewards;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Fees del pool', value: Number(fees.toFixed(2)) },
      { label: 'SUSHI rewards', value: Number(sushiRewards.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(grossReward).toLocaleString('es-AR'),
    centerLabel: 'Recompensa bruta',
    ariaLabel: 'Composición de la recompensa bruta: fees del pool y SUSHI rewards (antes de impermanent loss).',
  };
  // Insight dinámico: el impermanent loss puede comerse las recompensas
  const roiPct = (net / lp) * 100;
  const ilEatsRewards = ilLoss >= grossReward;
  const insight = {
    title: net < 0 ? 'Posición en pérdida' : (ilEatsRewards ? 'El IL se come las ganancias' : 'Posición rentable'),
    text: net < 0
      ? `Con un impermanent loss de **$${ilLoss.toLocaleString('es-AR')}**, las recompensas ($${Math.round(grossReward).toLocaleString('es-AR')}) no alcanzan: terminás con un neto de **-$${Math.abs(net).toLocaleString('es-AR', {maximumFractionDigits:0})}** (**${roiPct.toFixed(1)}%**) en ${months} meses. Revisá si el par es muy volátil.`
      : ilEatsRewards
        ? `Ganás $${Math.round(grossReward).toLocaleString('es-AR')} en fees + SUSHI, pero el impermanent loss de **$${ilLoss.toLocaleString('es-AR')}** se lleva casi todo: neto **$${Math.round(net).toLocaleString('es-AR')}** (**${roiPct.toFixed(1)}%**) en ${months} meses. Un par más estable rendiría más.`
        : `Tu posición rinde un neto de **$${Math.round(net).toLocaleString('es-AR')}** (**${roiPct.toFixed(1)}%**) en ${months} meses, ya descontado el impermanent loss de $${ilLoss.toLocaleString('es-AR')}. El APY combinado es de **${totalApy.toFixed(1)}%**.`,
    tone: (net < 0 || ilEatsRewards) ? 'warn' : 'good',
    icon: net < 0 ? '📉' : '🍣',
  };

  return {
    totalApy: Number(totalApy.toFixed(3)),
    sushiRewards: Number(sushiRewards.toFixed(2)),
    feesEarned: Number(fees.toFixed(2)),
    ilLoss: Number(ilLoss.toFixed(2)),
    netReturn: Number(net.toFixed(2)),
    _chart: chart,
    _insight: insight,
    explicacion: `LP $${lp}: fees ${(pool*100).toFixed(2)}% + SUSHI ${(sushi*100).toFixed(2)}%×${boost.toFixed(2)} − IL ${(il*100).toFixed(2)}% = net $${net.toFixed(2)} en ${months}m.`,
  };
}
