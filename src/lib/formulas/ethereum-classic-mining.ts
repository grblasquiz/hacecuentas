/** Ethereum Classic mining */
export interface Inputs { hashrateMh: number; powerWatts: number; electricityKwh: number; etcPrice: number; networkHashrateTh: number; blockReward: number; poolFee: number; days: number; }
export interface Outputs { etcMined: number; revenueUsd: number; electricityCost: number; netProfit: number; dailyProfit: number; explicacion: string; _insight?: any; _chart?: any; }
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

  const dailyNet = net / days;
  const margin = revenue > 0 ? (net / revenue) * 100 : 0;
  const insightText = net <= 0
    ? `A este precio y tarifa eléctrica, minar te da **pérdida**: los $${revenue.toFixed(2)} de ingresos no cubren los $${(elec + poolF).toFixed(2)} de electricidad y comisión. Necesitás luz más barata o un ETC más alto.`
    : margin < 25
    ? `Da ganancia, pero ajustada: **$${net.toFixed(2)}** netos (margen **${margin.toFixed(0)}%**) tras restar $${elec.toFixed(2)} de luz. Una suba del costo eléctrico o una baja del ETC te dejarían en rojo.`
    : `Rinde bien: **$${net.toFixed(2)}** netos en ${days} días (**$${dailyNet.toFixed(2)}/día**, margen **${margin.toFixed(0)}%**). La electricidad ($${elec.toFixed(2)}) es tu costo a vigilar.`;

  const out: Outputs = {
    etcMined: Number(etcMined.toFixed(6)),
    revenueUsd: Number(revenue.toFixed(2)),
    electricityCost: Number(elec.toFixed(2)),
    netProfit: Number(net.toFixed(2)),
    dailyProfit: Number((net / days).toFixed(2)),
    explicacion: `Con ${mh} MH/s minás ${etcMined.toFixed(4)} ETC en ${days}d = $${revenue.toFixed(2)}. Electricidad $${elec.toFixed(2)}. Profit neto $${net.toFixed(2)}.`,
    _insight: {
      title: net <= 0 ? 'No es rentable así' : 'Tu minería en números',
      text: insightText,
      tone: net <= 0 ? 'warn' : margin < 25 ? 'neutral' : 'good',
      icon: '⛏️',
    },
  };

  // Donut solo si hay ganancia: ingresos = electricidad + comisión + neto (las partes suman el total)
  if (net > 0 && revenue > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Ganancia neta', value: Number(net.toFixed(2)) },
        { label: 'Electricidad', value: Number(elec.toFixed(2)) },
        { label: 'Comisión pool', value: Number(poolF.toFixed(2)) },
      ].filter((s) => s.value > 0),
      prefix: '$',
      centerValue: `$${revenue.toFixed(2)}`,
      centerLabel: 'Ingresos brutos',
      ariaLabel: `Reparto de los $${revenue.toFixed(2)} de ingresos en ganancia neta, electricidad y comisión del pool`,
    };
  }

  return out;
}
