/** Staking AVAX rewards */
export interface Inputs { amount: number; apy: number; priceUsd: number; months: number; commission: number; }
export interface Outputs { tokensEarned: number; usdEarned: number; netTokens: number; monthlyTokens: number; effectiveApy: number; totalValue: number; explicacion: string; }
export function stakingAvaxRewards(i: Inputs): Outputs {
  const amt = Number(i.amount);
  const apy = Number(i.apy) / 100;
  const price = Number(i.priceUsd) || 1;
  const months = Number(i.months) || 12;
  const commission = Number(i.commission) / 100;
  if (!amt || amt <= 0) throw new Error('Ingresá la cantidad de AVAX');
  if (apy < 0) throw new Error('APY inválido');
  const years = months / 12;
  const grossTokens = amt * Math.pow(1 + apy / 365, 365 * years) - amt;
  const netTokens = grossTokens * (1 - commission);
  const usd = netTokens * price;
  const monthly = netTokens / months;
  const effectiveApy = (Math.pow(1 + apy / 365, 365) - 1) * 100 * (1 - commission);
  const totalValue = (amt + netTokens) * price;
  return {
    tokensEarned: Number(grossTokens.toFixed(4)),
    netTokens: Number(netTokens.toFixed(4)),
    usdEarned: Number(usd.toFixed(2)),
    monthlyTokens: Number(monthly.toFixed(4)),
    effectiveApy: Number(effectiveApy.toFixed(3)),
    totalValue: Number(totalValue.toFixed(2)),
    explicacion: `Stakeando ${amt} AVAX al ${(apy*100).toFixed(2)}% APY durante ${months} meses (comisión ${(commission*100).toFixed(1)}%): ganás ${netTokens.toFixed(2)} AVAX netos = $${usd.toFixed(2)} USD.`,
  };
}
