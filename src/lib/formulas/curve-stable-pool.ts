/** Curve stable pool APY */
export interface Inputs { depositUsd: number; baseApy: number; crvApr: number; boostMultiplier: number; extraRewardsApr: number; months: number; }
export interface Outputs { totalApy: number; baseFees: number; crvRewards: number; extraRewards: number; totalUsd: number; finalValue: number; explicacion: string; }
export function curveStablePoolApy(i: Inputs): Outputs {
  const d = Number(i.depositUsd);
  const base = Number(i.baseApy) / 100;
  const crv = Number(i.crvApr) / 100;
  const boost = Number(i.boostMultiplier) || 1;
  const extra = Number(i.extraRewardsApr) / 100;
  const months = Number(i.months) || 12;
  if (!d || d <= 0) throw new Error('Ingresá monto deposit');
  const years = months / 12;
  const baseFees = d * (Math.pow(1 + base / 365, 365 * years) - 1);
  const crvRewards = d * crv * boost * years;
  const extraRewards = d * extra * years;
  const total = baseFees + crvRewards + extraRewards;
  const totalApy = (base + crv * boost + extra) * 100;
  return {
    totalApy: Number(totalApy.toFixed(3)),
    baseFees: Number(baseFees.toFixed(2)),
    crvRewards: Number(crvRewards.toFixed(2)),
    extraRewards: Number(extraRewards.toFixed(2)),
    totalUsd: Number(total.toFixed(2)),
    finalValue: Number((d + total).toFixed(2)),
    explicacion: `Depósito de $${d} en Curve: base ${(base*100).toFixed(2)}% + CRV ${(crv*100).toFixed(2)}%×${boost.toFixed(2)}boost + extra ${(extra*100).toFixed(2)}% = ${totalApy.toFixed(2)}% APY total. Ganás $${total.toFixed(2)} en ${months}m.`,
  };
}
