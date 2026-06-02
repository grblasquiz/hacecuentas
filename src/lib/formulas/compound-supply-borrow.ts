/** Compound v3 supply vs borrow spread */
export interface Inputs { supplyAmount: number; supplyApy: number; borrowAmount: number; borrowApy: number; months: number; compRewardApr: number; }
export interface Outputs { netPnL: number; supplyEarned: number; borrowCost: number; compRewards: number; netApy: number; explicacion: string; _insight?: any; }
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
  const f = (v: number) => '$' + Number(v.toFixed(2)).toLocaleString('en-US');
  return {
    netPnL: Number(net.toFixed(2)),
    supplyEarned: Number(supplyEarned.toFixed(2)),
    borrowCost: Number(borrowCost.toFixed(2)),
    compRewards: Number(compRewards.toFixed(2)),
    netApy: Number(netApy.toFixed(3)),
    explicacion: `Supply ${sup} al ${(supApy*100).toFixed(2)}% + Borrow ${bor} al ${(borApy*100).toFixed(2)}%, COMP rewards ${(compR*100).toFixed(2)}%: net P&L $${net.toFixed(2)} en ${months} meses (${netApy.toFixed(2)}% APY).`,
    _insight: {
      title: net >= 0 ? 'Spread positivo' : 'Spread negativo',
      text: net >= 0
        ? `Tu posición rinde **${f(net)}** netos en ${months} meses (**${netApy.toFixed(2)}% APY** sobre el supply). El interés ganado (${f(supplyEarned)}) más los rewards COMP (${f(compRewards)}) superan al costo del borrow (${f(borrowCost)}).`
        : `Tu posición pierde **${f(Math.abs(net))}** en ${months} meses (**${netApy.toFixed(2)}% APY**): el costo del borrow (${f(borrowCost)}) supera al interés del supply (${f(supplyEarned)}) más los rewards COMP (${f(compRewards)}). Revisá tasas o reducí el apalancamiento.`,
      tone: net >= 0 ? 'good' : 'warn',
      icon: net >= 0 ? '💰' : '⚠️',
    },
  };
}
