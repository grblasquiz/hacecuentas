/** Kaspa KAS mining */
export interface Inputs { hashrateGh: number; powerWatts: number; electricityKwh: number; kasPrice: number; networkHashratePh: number; poolFee: number; days: number; }
export interface Outputs { kasMined: number; revenueUsd: number; electricityCost: number; netProfit: number; dailyKas: number; explicacion: string; }
export function kaspaKasMining(i: Inputs): Outputs {
  const gh = Number(i.hashrateGh);
  const watts = Number(i.powerWatts);
  const kwh = Number(i.electricityKwh);
  const price = Number(i.kasPrice);
  const netPh = Number(i.networkHashratePh) || 1500;
  const poolFee = Number(i.poolFee) / 100;
  const days = Number(i.days) || 30;
  if (!gh || gh <= 0) throw new Error('Hashrate GH/s');
  const blockReward = 75;
  const blocksPerSecond = 1;
  const blocksPerDay = 86400;
  const netGh = netPh * 1e6;
  const kasPerDay = (gh / netGh) * blockReward * blocksPerDay;
  const kasMined = kasPerDay * days;
  const revenue = kasMined * price;
  const elec = (watts * 24) / 1000 * kwh * days;
  const poolF = revenue * poolFee;
  const net = revenue - elec - poolF;
  return {
    kasMined: Number(kasMined.toFixed(2)),
    revenueUsd: Number(revenue.toFixed(2)),
    electricityCost: Number(elec.toFixed(2)),
    netProfit: Number(net.toFixed(2)),
    dailyKas: Number(kasPerDay.toFixed(2)),
    explicacion: `${gh} GH/s durante ${days}d: ${kasMined.toFixed(0)} KAS ($${revenue.toFixed(2)}). Luz $${elec.toFixed(2)}, pool fee $${poolF.toFixed(2)}. Profit $${net.toFixed(2)}.`,
  };
}
