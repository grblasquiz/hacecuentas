/** Staking BNB rewards */
export interface Inputs { amount: number; apy: number; priceUsd: number; months: number; commission: number; }
export interface Outputs { tokensEarned: number; usdEarned: number; netTokens: number; monthlyTokens: number; effectiveApy: number; totalValue: number; explicacion: string; _chart?: any; _insight?: any; }
export function stakingBnbRewards(i: Inputs): Outputs {
  const amt = Number(i.amount);
  const apy = Number(i.apy) / 100;
  const price = Number(i.priceUsd) || 1;
  const months = Number(i.months) || 12;
  const commission = Number(i.commission) / 100;
  if (!amt || amt <= 0) throw new Error('Ingresá la cantidad de BNB');
  if (apy < 0) throw new Error('APY inválido');
  const years = months / 12;
  const grossTokens = amt * Math.pow(1 + apy / 365, 365 * years) - amt;
  const netTokens = grossTokens * (1 - commission);
  const usd = netTokens * price;
  const monthly = netTokens / months;
  const effectiveApy = (Math.pow(1 + apy / 365, 365) - 1) * 100 * (1 - commission);
  const totalValue = (amt + netTokens) * price;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital inicial', value: amt * price },
      { label: 'Recompensas netas', value: netTokens * price },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalValue).toLocaleString('es-AR'),
    centerLabel: 'Valor final',
    ariaLabel: 'Composición del valor final: capital inicial más recompensas de staking',
  };
  const rewardShare = totalValue > 0 ? (usd / totalValue) * 100 : 0;
  const highFee = commission >= 0.15;
  const insight = {
    title: highFee ? 'Comisión alta del validador' : 'Recompensas proyectadas',
    text: highFee
      ? `A ${(apy*100).toFixed(2)}% APY ganás **${netTokens.toFixed(2)} BNB** (~$${usd.toFixed(0)}) en ${months} meses, pero el validador se queda con el **${(commission*100).toFixed(1)}%** de las recompensas. Buscá un pool con comisión más baja para retener más rendimiento.`
      : `Stakeando ${amt} BNB a ${(apy*100).toFixed(2)}% APY sumás **${netTokens.toFixed(2)} BNB netos** (~$${usd.toFixed(0)}) en ${months} meses, el **${rewardShare.toFixed(1)}%** de tu valor final. APY efectivo (con interés compuesto diario): **${effectiveApy.toFixed(2)}%**. Recordá que el valor en USD depende del precio del token.`,
    tone: highFee ? 'warn' : 'good',
    icon: highFee ? '✂️' : '🟡',
  };
  return {
    tokensEarned: Number(grossTokens.toFixed(4)),
    netTokens: Number(netTokens.toFixed(4)),
    usdEarned: Number(usd.toFixed(2)),
    monthlyTokens: Number(monthly.toFixed(4)),
    effectiveApy: Number(effectiveApy.toFixed(3)),
    totalValue: Number(totalValue.toFixed(2)),
    _chart: chart,
    explicacion: `Stakeando ${amt} BNB al ${(apy*100).toFixed(2)}% APY durante ${months} meses (comisión ${(commission*100).toFixed(1)}%): ganás ${netTokens.toFixed(2)} BNB netos = $${usd.toFixed(2)} USD.`,
    _insight: insight,
  };
}
