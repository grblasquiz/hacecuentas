/** EigenLayer restaking rewards */
export interface Inputs { stEthRestaked: number; baseEthApr: number; avsRewardApr: number; pointsMultiplier: number; ethPriceUsd: number; months: number; }
export interface Outputs { totalApy: number; baseRewardEth: number; avsRewardEth: number; totalRewardEth: number; totalRewardUsd: number; pointsEstimated: number; explicacion: string; _chart?: any; }
export function eigenLayerRestaking(i: Inputs): Outputs {
  const amount = Number(i.stEthRestaked);
  const baseApr = Number(i.baseEthApr) / 100;
  const avsApr = Number(i.avsRewardApr) / 100;
  const mult = Number(i.pointsMultiplier) || 1;
  const price = Number(i.ethPriceUsd) || 3200;
  const months = Number(i.months) || 12;
  if (!amount || amount <= 0) throw new Error('Ingresá cantidad stETH');
  const years = months / 12;
  const baseReward = amount * (Math.pow(1 + baseApr / 365, 365 * years) - 1);
  const avsReward = amount * (Math.pow(1 + avsApr / 365, 365 * years) - 1);
  const total = baseReward + avsReward;
  const totalApy = (baseApr + avsApr) * 100;
  const points = amount * (months * 30) * mult;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Reward base (ETH staking)', value: Number((baseReward * price).toFixed(2)) },
      { label: 'Reward AVS', value: Number((avsReward * price).toFixed(2)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total * price).toLocaleString('es-AR'),
    centerLabel: 'Reward total USD',
    ariaLabel: 'Composición de las recompensas de restaking en EigenLayer en USD: reward base de staking de ETH frente a reward de los AVS.',
  };
  return {
    totalApy: Number(totalApy.toFixed(2)),
    baseRewardEth: Number(baseReward.toFixed(6)),
    avsRewardEth: Number(avsReward.toFixed(6)),
    totalRewardEth: Number(total.toFixed(6)),
    totalRewardUsd: Number((total * price).toFixed(2)),
    pointsEstimated: Number(points.toFixed(0)),
    explicacion: `Restakeando ${amount} stETH: APY total ${totalApy.toFixed(2)}% (${(baseApr*100).toFixed(2)}% base + ${(avsApr*100).toFixed(2)}% AVS). En ${months} meses: ${total.toFixed(4)} ETH = $${(total*price).toFixed(2)} + ${points.toFixed(0)} puntos.`,
    _chart: chart,
  };
}
