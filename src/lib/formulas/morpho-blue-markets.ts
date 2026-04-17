/** Morpho Blue isolated markets */
export interface Inputs { supplyUsd: number; supplyApy: number; rewardApr: number; ltv: number; borrowApy: number; borrowUsd: number; months: number; }
export interface Outputs { netApy: number; supplyUsdEarned: number; borrowUsdCost: number; rewardsUsd: number; leverageMultiplier: number; explicacion: string; }
export function morphoBlueMarkets(i: Inputs): Outputs {
  const sup = Number(i.supplyUsd);
  const supApy = Number(i.supplyApy) / 100;
  const rAp = Number(i.rewardApr) / 100;
  const ltv = Number(i.ltv) / 100;
  const borApy = Number(i.borrowApy) / 100;
  const bor = Number(i.borrowUsd);
  const months = Number(i.months) || 12;
  if (!sup || sup <= 0) throw new Error('Ingresá supply');
  const years = months / 12;
  const supEarned = sup * (Math.pow(1 + supApy / 365, 365 * years) - 1);
  const borCost = bor * (Math.pow(1 + borApy / 365, 365 * years) - 1);
  const rewards = (sup + bor) * rAp * years;
  const net = supEarned - borCost + rewards;
  const netApy = (net / sup) * 100 / years;
  const leverage = bor > 0 ? (sup + bor) / sup : 1;
  return {
    netApy: Number(netApy.toFixed(3)),
    supplyUsdEarned: Number(supEarned.toFixed(2)),
    borrowUsdCost: Number(borCost.toFixed(2)),
    rewardsUsd: Number(rewards.toFixed(2)),
    leverageMultiplier: Number(leverage.toFixed(2)),
    explicacion: `Supply $${sup} (APY ${(supApy*100).toFixed(2)}%) + borrow $${bor} (APY ${(borApy*100).toFixed(2)}%) + rewards ${(rAp*100).toFixed(2)}%: APY neto ${netApy.toFixed(2)}%, leverage ${leverage.toFixed(2)}x.`,
  };
}
