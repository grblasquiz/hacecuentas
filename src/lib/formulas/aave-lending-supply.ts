/** AAVE v3 supply APY with rewards */
export interface Inputs { supplyAmount: number; supplyApy: number; rewardApr: number; assetPriceUsd: number; months: number; }
export interface Outputs { supplyInterestUsd: number; rewardTokensUsd: number; totalApy: number; totalReturnUsd: number; netFinalValue: number; explicacion: string; _chart?: any; }
export function aaveLendingSupply(i: Inputs): Outputs {
  const p = Number(i.supplyAmount);
  const supplyApy = Number(i.supplyApy) / 100;
  const rewardApr = Number(i.rewardApr) / 100;
  const price = Number(i.assetPriceUsd) || 1;
  const months = Number(i.months) || 12;
  if (!p || p <= 0) throw new Error('Ingresá el monto a supply');
  const years = months / 12;
  const supplyInt = p * (Math.pow(1 + supplyApy / 365, 365 * years) - 1);
  const rewardTokens = p * rewardApr * years;
  const supplyUsd = supplyInt * price;
  const rewardUsd = rewardTokens * price;
  const total = supplyUsd + rewardUsd;
  const totalApy = (supplyApy + rewardApr) * 100;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Interés supply', value: Number(supplyUsd.toFixed(2)) },
      { label: 'Rewards', value: Number(rewardUsd.toFixed(2)) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Ganancia total',
    ariaLabel: 'Composición de la ganancia: interés del supply y rewards.',
  };
  return {
    supplyInterestUsd: Number(supplyUsd.toFixed(2)),
    rewardTokensUsd: Number(rewardUsd.toFixed(2)),
    totalApy: Number(totalApy.toFixed(3)),
    totalReturnUsd: Number(total.toFixed(2)),
    netFinalValue: Number((p * price + total).toFixed(2)),
    explicacion: `Supply de ${p} al ${(supplyApy*100).toFixed(2)}% APY + ${(rewardApr*100).toFixed(2)}% rewards en ${months} meses: gano $${total.toFixed(2)} USD.`,
    _chart: chart,
  };
}
