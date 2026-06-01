/** Bitcoin mining profitability */
export interface Inputs { hashrateTh: number; powerWatts: number; electricityKwh: number; btcPrice: number; networkDifficulty: number; poolFee: number; days: number; }
export interface Outputs { btcMined: number; revenueUsd: number; electricityCost: number; poolFeeCost: number; netProfit: number; breakEvenBtc: number; roiPerc: number; explicacion: string; _insight?: any; _chart?: any; }
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
  const out: Outputs = {
    btcMined: Number(btcMined.toFixed(8)),
    revenueUsd: Number(revenue.toFixed(2)),
    electricityCost: Number(electricity.toFixed(2)),
    poolFeeCost: Number(poolFeeCost.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    breakEvenBtc: Number(breakEven.toFixed(8)),
    roiPerc: Number(roi.toFixed(2)),
    explicacion: `Con ${th} TH/s y consumo ${watts}W durante ${days}d: minás ${btcMined.toFixed(6)} BTC ($${revenue.toFixed(2)}). Electricidad $${electricity.toFixed(2)}, pool fee $${poolFeeCost.toFixed(2)}. Profit neto $${netProfit.toFixed(2)} (${roi.toFixed(1)}% ROI).`,
  };
  out._insight = netProfit >= 0
    ? {
        title: 'Minería rentable… por ahora',
        text: `En ${days} días generás **$${revenue.toFixed(0)}** de ingresos y te queda **$${netProfit.toFixed(0)}** de profit neto (**${roi.toFixed(1)}% de margen**), después de **$${electricity.toFixed(0)}** de luz y **$${poolFeeCost.toFixed(0)}** de pool fee. Ojo: si sube la dificultad de red o el precio de la electricidad, el margen se achica rápido.`,
        tone: 'good',
        icon: '⛏️',
      }
    : {
        title: 'Minás a pérdida',
        text: `Los **$${revenue.toFixed(0)}** que minás en ${days} días no alcanzan a cubrir **$${electricity.toFixed(0)}** de luz más **$${poolFeeCost.toFixed(0)}** de pool fee: perdés **$${Math.abs(netProfit).toFixed(0)}**. Necesitás un precio de electricidad más bajo o un BTC más caro para dar vuelta el resultado.`,
        tone: 'warn',
        icon: '⛏️',
      };
  // Donut sólo cuando hay profit: electricidad + pool fee + neto suman exactamente el ingreso.
  if (netProfit >= 0 && revenue > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Profit neto', value: Number(netProfit.toFixed(2)) },
        { label: 'Electricidad', value: Number(electricity.toFixed(2)) },
        { label: 'Pool fee', value: Number(poolFeeCost.toFixed(2)) },
      ],
      prefix: '$',
      centerValue: `$${revenue.toFixed(0)}`,
      centerLabel: 'Ingreso bruto',
      ariaLabel: `Distribución del ingreso de minería: profit neto $${netProfit.toFixed(0)}, electricidad $${electricity.toFixed(0)}, pool fee $${poolFeeCost.toFixed(0)}.`,
    };
  }
  return out;
}
