/** Staking ETH anual rewards */
export interface Inputs { ethStaked: number; apr: number; ethPriceUsd: number; months: number; feeValidator: number; }
export interface Outputs { ethEarned: number; usdEarned: number; netEthAfterFee: number; monthlyEth: number; effectiveApy: number; explicacion: string; _chart?: any; }
export function stakingEthRewards(i: Inputs): Outputs {
  const staked = Number(i.ethStaked);
  const apr = Number(i.apr) / 100;
  const price = Number(i.ethPriceUsd) || 3000;
  const months = Number(i.months) || 12;
  const fee = Number(i.feeValidator) / 100;
  if (!staked || staked <= 0) throw new Error('Ingresá cantidad de ETH a stakear');
  if (apr < 0) throw new Error('APR inválido');
  const years = months / 12;
  const grossEth = staked * Math.pow(1 + apr / 365, 365 * years) - staked;
  const netEth = grossEth * (1 - fee);
  const usd = netEth * price;
  const monthlyEth = netEth / months;
  const effectiveApy = (Math.pow(1 + apr / 365, 365) - 1) * 100 * (1 - fee);
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital inicial', value: staked * price },
      { label: 'Recompensas netas', value: netEth * price },
    ],
    prefix: '$',
    centerValue: '$' + Math.round((staked + netEth) * price).toLocaleString('es-AR'),
    centerLabel: 'Valor final',
    ariaLabel: 'Composición del valor final: capital inicial más recompensas de staking de ETH',
  };
  return {
    ethEarned: Number(grossEth.toFixed(6)),
    usdEarned: Number(usd.toFixed(2)),
    netEthAfterFee: Number(netEth.toFixed(6)),
    monthlyEth: Number(monthlyEth.toFixed(6)),
    effectiveApy: Number(effectiveApy.toFixed(3)),
    _chart: chart,
    explicacion: `Stakeando ${staked} ETH al ${(apr*100).toFixed(2)}% APR durante ${months} meses (fee validador ${(fee*100).toFixed(1)}%): ganás ${netEth.toFixed(4)} ETH netos = $${usd.toFixed(2)} USD. APY efectivo ${effectiveApy.toFixed(2)}%.`,
  };
}
