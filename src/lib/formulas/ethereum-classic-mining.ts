/** Ethereum Classic mining */
export interface Inputs { hashrateMh: number; powerWatts: number; electricityKwh: number; etcPrice: number; networkHashrateTh: number; blockReward: number; poolFee: number; days: number; }
export interface Outputs { etcMined: number; revenueUsd: number; electricityCost: number; netProfit: number; dailyProfit: number; explicacion: string; }
export function ethereumClassicMining(i: Inputs): Outputs {
  const mh = Number(i.hashrateMh);
  const watts = Number(i.powerWatts);
  const kwh = Number(i.electricityKwh);
  const price = Number(i.etcPrice);
  const netTh = Number(i.networkHashrateTh) || 150;
  const reward = Number(i.blockReward) || 2.048;
  const poolFee = Number(i.poolFee) / 100;
  const days = Number(i.days) || 30;
  if (!mh || mh <= 0) throw new Error('Hashrate MH/s');
  const blocksPerDay = 86400 / 13;
  const netMh = netTh * 1e6;
  const etcPerDay = (mh / netMh) * reward * blocksPerDay;
  const etcMined = etcPerDay * days;
  const revenue = etcMined * price;
  const elec = (watts * 24) / 1000 * kwh * days;
  const poolF = revenue * poolFee;
  const net = revenue - elec - poolF;
  return {
    etcMined: Number(etcMined.toFixed(6)),
    revenueUsd: Number(revenue.toFixed(2)),
    electricityCost: Number(elec.toFixed(2)),
    netProfit: Number(net.toFixed(2)),
    dailyProfit: Number((net / days).toFixed(2)),
    explicacion: `Con ${mh} MH/s minás ${etcMined.toFixed(4)} ETC en ${days}d = $${revenue.toFixed(2)}. Electricidad $${elec.toFixed(2)}. Profit neto $${net.toFixed(2)}.`,
  };
}
