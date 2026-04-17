/** Uniswap v3 LP fees estimate */
export interface Inputs { liquidityUsd: number; poolTvl: number; dailyVolume: number; feeTier: number; inRangePct: number; days: number; }
export interface Outputs { dailyFees: number; totalFees: number; feeApr: number; poolDailyFees: number; yourShare: number; explicacion: string; }
export function uniswapV3Fees(i: Inputs): Outputs {
  const liq = Number(i.liquidityUsd);
  const tvl = Number(i.poolTvl);
  const vol = Number(i.dailyVolume);
  const tier = Number(i.feeTier) / 10000;
  const inRange = Number(i.inRangePct) / 100;
  const days = Number(i.days) || 30;
  if (!liq || liq <= 0) throw new Error('Ingresá liquidez');
  if (!tvl || tvl <= 0) throw new Error('Ingresá TVL del pool');
  const poolDailyFees = vol * tier;
  const yourShare = liq / tvl;
  const dailyFees = poolDailyFees * yourShare * inRange;
  const totalFees = dailyFees * days;
  const feeApr = (dailyFees * 365 / liq) * 100;
  return {
    dailyFees: Number(dailyFees.toFixed(2)),
    totalFees: Number(totalFees.toFixed(2)),
    feeApr: Number(feeApr.toFixed(2)),
    poolDailyFees: Number(poolDailyFees.toFixed(2)),
    yourShare: Number((yourShare * 100).toFixed(4)),
    explicacion: `Con $${liq} en un pool de $${tvl} (${(yourShare*100).toFixed(3)}%), volumen diario $${vol} y fee tier ${(tier*100).toFixed(2)}%: ganás $${dailyFees.toFixed(2)}/día (${feeApr.toFixed(2)}% APR).`,
  };
}
