/** Staking ADA rewards */
export interface Inputs { amount: number; apy: number; priceUsd: number; months: number; commission: number; }
export interface Outputs { tokensEarned: number; usdEarned: number; netTokens: number; monthlyTokens: number; effectiveApy: number; totalValue: number; explicacion: string; _insight?: any; _chart?: any; }
export function stakingAdaRewards(i: Inputs): Outputs {
  const amt = Number(i.amount);
  const apy = Number(i.apy) / 100;
  const price = Number(i.priceUsd) || 1;
  const months = Number(i.months) || 12;
  const commission = Number(i.commission) / 100;
  if (!amt || amt <= 0) throw new Error('Ingresá la cantidad de ADA');
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
      { label: 'Capital inicial', value: Number((amt * price).toFixed(2)) },
      { label: 'Recompensas netas', value: Number(usd.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalValue).toLocaleString('es-AR'),
    centerLabel: 'Valor total',
    ariaLabel: 'Composición del valor final: capital inicial más recompensas netas de staking',
  };
  const comisionTokens = grossTokens * commission;
  const insight = {
    title: 'Tus recompensas de staking',
    text: commission > 0.1
      ? `En ${months} meses ganás **${netTokens.toFixed(2)} ADA netos** ($${usd.toFixed(2)} USD), pero la comisión del ${(commission*100).toFixed(1)}% del validador te resta **${comisionTokens.toFixed(2)} ADA**. Buscá un pool con comisión más baja para quedarte con más.`
      : `Stakeando ${amt} ADA sumás **${netTokens.toFixed(2)} ADA netos** ($${usd.toFixed(2)} USD) en ${months} meses, un **${effectiveApy.toFixed(2)}% efectivo anual** tras comisión. Capitalizar las recompensas acelera el crecimiento.`,
    tone: commission > 0.1 ? 'warn' as const : 'good' as const,
    icon: '🪙',
  };
  return {
    tokensEarned: Number(grossTokens.toFixed(4)),
    netTokens: Number(netTokens.toFixed(4)),
    usdEarned: Number(usd.toFixed(2)),
    monthlyTokens: Number(monthly.toFixed(4)),
    effectiveApy: Number(effectiveApy.toFixed(3)),
    totalValue: Number(totalValue.toFixed(2)),
    explicacion: `Stakeando ${amt} ADA al ${(apy*100).toFixed(2)}% APY durante ${months} meses (comisión ${(commission*100).toFixed(1)}%): ganás ${netTokens.toFixed(2)} ADA netos = $${usd.toFixed(2)} USD.`,
    _insight: insight,
    _chart: chart,
  };
}
