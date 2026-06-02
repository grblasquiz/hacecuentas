/** Kaspa KAS mining */
export interface Inputs { hashrateGh: number; powerWatts: number; electricityKwh: number; kasPrice: number; networkHashratePh: number; poolFee: number; days: number; }
export interface Outputs { kasMined: number; revenueUsd: number; electricityCost: number; netProfit: number; dailyKas: number; explicacion: string; _insight?: any; _chart?: any; }
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

  const revenueR = Number(revenue.toFixed(2));
  const elecR = Number(elec.toFixed(2));
  const poolFR = Number(poolF.toFixed(2));
  const netR = Number(net.toFixed(2));
  const margen = revenue > 0 ? (net / revenue) * 100 : 0;

  const _insight = {
    title: 'Rentabilidad del minado',
    text: net >= 0
      ? `Minando a **${gh} GH/s** durante **${days} días** generás **$${revenueR.toFixed(2)}** y, tras restar luz ($${elecR.toFixed(2)}) y pool fee ($${poolFR.toFixed(2)}), te queda una ganancia de **$${netR.toFixed(2)}** (margen **${margen.toFixed(0)}%**).`
      : `Minando a **${gh} GH/s** durante **${days} días** generás **$${revenueR.toFixed(2)}**, pero la luz ($${elecR.toFixed(2)}) y el pool fee ($${poolFR.toFixed(2)}) dejan un resultado **negativo de $${netR.toFixed(2)}**. Con estos parámetros no conviene minar.`,
    tone: net >= 0 ? 'good' : 'warn',
    icon: '⛏️',
  };

  // Donut sólo si hay ganancia: el revenue se reparte en profit + luz + pool fee
  const profitSlice = Number((revenueR - elecR - poolFR).toFixed(2));
  const _chart = (net > 0 && revenueR > 0) ? {
    type: 'doughnut',
    slices: [
      { label: 'Ganancia neta', value: profitSlice },
      { label: 'Electricidad', value: elecR },
      { label: 'Comisión pool', value: poolFR },
    ],
    prefix: '$',
    centerValue: '$' + revenueR.toFixed(2),
    centerLabel: 'Ingreso bruto',
    ariaLabel: `Reparto del ingreso bruto de $${revenueR.toFixed(2)}: ganancia neta $${profitSlice.toFixed(2)}, electricidad $${elecR.toFixed(2)} y comisión de pool $${poolFR.toFixed(2)}.`,
  } : undefined;

  return {
    kasMined: Number(kasMined.toFixed(2)),
    revenueUsd: revenueR,
    electricityCost: elecR,
    netProfit: netR,
    dailyKas: Number(kasPerDay.toFixed(2)),
    explicacion: `${gh} GH/s durante ${days}d: ${kasMined.toFixed(0)} KAS ($${revenue.toFixed(2)}). Luz $${elec.toFixed(2)}, pool fee $${poolF.toFixed(2)}. Profit $${net.toFixed(2)}.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
