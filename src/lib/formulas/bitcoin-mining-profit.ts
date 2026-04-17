/** Bitcoin mining profitability */
export interface Inputs { hashrateTh: number; powerWatts: number; electricityKwh: number; btcPrice: number; networkDifficulty: number; poolFee: number; days: number; }
export interface Outputs { btcMined: number; revenueUsd: number; electricityCost: number; poolFeeCost: number; netProfit: number; breakEvenBtc: number; roiPerc: number; explicacion: string; }
export function bitcoinMiningProfit(i: Inputs): Outputs {
  const th = Number(i.hashrateTh);
  const watts = Number(i.powerWatts);
  const kwhRate = Number(i.electricityKwh);
  const btcPrice = Number(i.btcPrice);
  const diff = Number(i.networkDifficulty) || 110e12;
  const poolFee = Number(i.poolFee) / 100;
  const days = Number(i.days) || 30;
  if (!th || th <= 0) throw new Error('Ingresá hashrate');
  if (!btcPrice || btcPrice <= 0) throw new Error('Precio BTC');
  const blockReward = 3.125;
  const blocksPerDay = 144;
  const networkHashrateEh = diff * Math.pow(2, 32) / 600 / 1e18;
  const networkThPerS = networkHashrateEh * 1e6;
  const btcPerDay = (th / networkThPerS) * blockReward * blocksPerDay;
  const btcMined = btcPerDay * days;
  const revenue = btcMined * btcPrice;
  const kwhPerDay = (watts * 24) / 1000;
  const electricity = kwhPerDay * kwhRate * days;
  const poolFeeCost = revenue * poolFee;
  const netProfit = revenue - electricity - poolFeeCost;
  const breakEven = (electricity + poolFeeCost) / btcPrice;
  const roi = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  return {
    btcMined: Number(btcMined.toFixed(8)),
    revenueUsd: Number(revenue.toFixed(2)),
    electricityCost: Number(electricity.toFixed(2)),
    poolFeeCost: Number(poolFeeCost.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    breakEvenBtc: Number(breakEven.toFixed(8)),
    roiPerc: Number(roi.toFixed(2)),
    explicacion: `Con ${th} TH/s y consumo ${watts}W durante ${days}d: minás ${btcMined.toFixed(6)} BTC ($${revenue.toFixed(2)}). Electricidad $${electricity.toFixed(2)}, pool fee $${poolFeeCost.toFixed(2)}. Profit neto $${netProfit.toFixed(2)} (${roi.toFixed(1)}% ROI).`,
  };
}
