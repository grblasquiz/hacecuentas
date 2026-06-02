/** Pendle fixed yield PT */
export interface Inputs { ptTokenAmount: number; ptPriceUsd: number; impliedApy: number; daysToMaturity: number; yieldTokenPrice: number; }
export interface Outputs { fixedYieldUsd: number; valueAtMaturity: number; ytImpliedValue: number; breakEvenPrice: number; yieldTotal: number; explicacion: string; _insight?: any; _chart?: any; }
export function pendleFixedYield(i: Inputs): Outputs {
  const pt = Number(i.ptTokenAmount);
  const price = Number(i.ptPriceUsd);
  const apy = Number(i.impliedApy) / 100;
  const days = Number(i.daysToMaturity) || 180;
  const ytPrice = Number(i.yieldTokenPrice) || 0;
  if (!pt || pt <= 0) throw new Error('Ingresá PT');
  if (!price || price <= 0) throw new Error('Precio PT');
  const cost = pt * price;
  const years = days / 365;
  const valueAtMaturity = pt;
  const fixedYield = pt - cost;
  const totalYield = (fixedYield / cost) * (365 / days) * 100;
  const ytImplied = pt * ytPrice;
  const breakEven = 1 / (1 + apy * years);

  const _insight = {
    title: 'Tu rendimiento fijo',
    text: fixedYield >= 0
      ? `Comprando a descuento, asegurás **$${fixedYield.toFixed(2)}** de ganancia sobre $${cost.toFixed(2)} invertidos: un **${totalYield.toFixed(2)}% APY** fijo si mantenés el PT hasta el vencimiento en ${days} días.`
      : `A este precio el PT cotiza sobre la par: redimís **$${fixedYield.toFixed(2)}** (pérdida) sobre $${cost.toFixed(2)}. Un PT solo conviene comprado por debajo de $1.`,
    tone: fixedYield > 0 ? 'good' : 'warn',
    icon: '🔒',
  };

  const _chart = (fixedYield > 0 && cost > 0) ? {
    type: 'doughnut',
    slices: [
      { label: 'Capital invertido', value: Number(cost.toFixed(2)) },
      { label: 'Rendimiento fijo', value: Number(fixedYield.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: `$${valueAtMaturity.toFixed(2)}`,
    centerLabel: 'Redención',
    ariaLabel: `Redención de $${valueAtMaturity.toFixed(2)}: $${cost.toFixed(2)} de capital más $${fixedYield.toFixed(2)} de rendimiento fijo`,
  } : undefined;

  return {
    fixedYieldUsd: Number(fixedYield.toFixed(2)),
    valueAtMaturity: Number(valueAtMaturity.toFixed(2)),
    ytImpliedValue: Number(ytImplied.toFixed(2)),
    breakEvenPrice: Number(breakEven.toFixed(4)),
    yieldTotal: Number(totalYield.toFixed(3)),
    explicacion: `Comprás ${pt} PT a $${price} (total $${cost.toFixed(2)}). A vencimiento en ${days}d redimís por $${valueAtMaturity.toFixed(2)}: fixed yield $${fixedYield.toFixed(2)} (${totalYield.toFixed(2)}% APY).`,
    _insight,
    _chart,
  };
}
