/** Compound v3 supply vs borrow spread */
export interface Inputs { supplyAmount: number; supplyApy: number; borrowAmount: number; borrowApy: number; months: number; compRewardApr: number; }
export interface Outputs { netPnL: number; supplyEarned: number; borrowCost: number; compRewards: number; netApy: number; explicacion: string; }
export function compoundSupplyBorrow(i: Inputs): Outputs {
  const sup = Number(i.supplyAmount);
  const supApy = Number(i.supplyApy) / 100;
  const bor = Number(i.borrowAmount);
  const borApy = Number(i.borrowApy) / 100;
  const months = Number(i.months) || 12;
  const compR = Number(i.compRewardApr) / 100;
  if (!sup || sup <= 0) throw new Error('Ingresá supply amount');
  const years = months / 12;
  const supplyEarned = sup * (Math.pow(1 + supApy / 365, 365 * years) - 1);
  const borrowCost = bor * (Math.pow(1 + borApy / 365, 365 * years) - 1);
  const compRewards = (sup + bor) * compR * years;
  const net = supplyEarned - borrowCost + compRewards;
  const netApy = (net / sup) * 100 / years;
  return {
    netPnL: Number(net.toFixed(2)),
    supplyEarned: Number(supplyEarned.toFixed(2)),
    borrowCost: Number(borrowCost.toFixed(2)),
    compRewards: Number(compRewards.toFixed(2)),
    netApy: Number(netApy.toFixed(3)),
    explicacion: `Supply ${sup} al ${(supApy*100).toFixed(2)}% + Borrow ${bor} al ${(borApy*100).toFixed(2)}%, COMP rewards ${(compR*100).toFixed(2)}%: net P&L $${net.toFixed(2)} en ${months} meses (${netApy.toFixed(2)}% APY).`,
  };
}
