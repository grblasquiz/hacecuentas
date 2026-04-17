/** GMX GLP APR */
export interface Inputs { glpAmount: number; glpPriceUsd: number; ethRewardApr: number; escGmxApr: number; months: number; }
export interface Outputs { totalApr: number; ethRewardsUsd: number; escGmxUsd: number; totalUsd: number; monthlyUsd: number; explicacion: string; }
export function gmxGlpApr(i: Inputs): Outputs {
  const amt = Number(i.glpAmount);
  const price = Number(i.glpPriceUsd) || 1;
  const ethApr = Number(i.ethRewardApr) / 100;
  const escGmx = Number(i.escGmxApr) / 100;
  const months = Number(i.months) || 12;
  if (!amt || amt <= 0) throw new Error('Ingresá GLP');
  const years = months / 12;
  const principal = amt * price;
  const ethRewards = principal * ethApr * years;
  const escRewards = principal * escGmx * years;
  const total = ethRewards + escRewards;
  const totalApr = (ethApr + escGmx) * 100;
  return {
    totalApr: Number(totalApr.toFixed(3)),
    ethRewardsUsd: Number(ethRewards.toFixed(2)),
    escGmxUsd: Number(escRewards.toFixed(2)),
    totalUsd: Number(total.toFixed(2)),
    monthlyUsd: Number((total / months).toFixed(2)),
    explicacion: `${amt} GLP ($${principal.toFixed(2)}) al ${(ethApr*100).toFixed(2)}% ETH + ${(escGmx*100).toFixed(2)}% esGMX = ${totalApr.toFixed(2)}% APR total. Ingreso $${total.toFixed(2)} USD ($${(total/months).toFixed(2)}/mes).`,
  };
}
