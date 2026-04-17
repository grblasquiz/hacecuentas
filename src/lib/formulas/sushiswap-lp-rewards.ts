/** Sushiswap LP + SUSHI rewards */
export interface Inputs { lpUsd: number; poolApr: number; sushiApr: number; boostMultiplier: number; months: number; ilPercent: number; }
export interface Outputs { totalApy: number; sushiRewards: number; feesEarned: number; ilLoss: number; netReturn: number; explicacion: string; }
export function sushiswapLpRewards(i: Inputs): Outputs {
  const lp = Number(i.lpUsd);
  const pool = Number(i.poolApr) / 100;
  const sushi = Number(i.sushiApr) / 100;
  const boost = Number(i.boostMultiplier) || 1;
  const months = Number(i.months) || 12;
  const il = Number(i.ilPercent) / 100;
  if (!lp || lp <= 0) throw new Error('Ingresá LP USD');
  const years = months / 12;
  const fees = lp * pool * years;
  const sushiRewards = lp * sushi * boost * years;
  const ilLoss = lp * il;
  const net = fees + sushiRewards - ilLoss;
  const totalApy = (pool + sushi * boost) * 100;
  return {
    totalApy: Number(totalApy.toFixed(3)),
    sushiRewards: Number(sushiRewards.toFixed(2)),
    feesEarned: Number(fees.toFixed(2)),
    ilLoss: Number(ilLoss.toFixed(2)),
    netReturn: Number(net.toFixed(2)),
    explicacion: `LP $${lp}: fees ${(pool*100).toFixed(2)}% + SUSHI ${(sushi*100).toFixed(2)}%×${boost.toFixed(2)} − IL ${(il*100).toFixed(2)}% = net $${net.toFixed(2)} en ${months}m.`,
  };
}
