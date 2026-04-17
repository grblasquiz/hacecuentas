/** Impermanent loss for 50/50 pool */
export interface Inputs { initialPrice: number; currentPrice: number; initialAmountUsd: number; }
export interface Outputs { priceRatio: number; ilPercent: number; ilUsd: number; valueHodl: number; valueLp: number; breakEvenFees: number; explicacion: string; }
export function impermanentLossPool(i: Inputs): Outputs {
  const p0 = Number(i.initialPrice);
  const p1 = Number(i.currentPrice);
  const value0 = Number(i.initialAmountUsd);
  if (!p0 || p0 <= 0) throw new Error('Precio inicial inválido');
  if (!p1 || p1 <= 0) throw new Error('Precio actual inválido');
  if (!value0 || value0 <= 0) throw new Error('Ingresá monto inicial');
  const k = p1 / p0;
  const ilPct = (2 * Math.sqrt(k) / (1 + k) - 1) * 100;
  const valueHodl = value0 * (0.5 * k + 0.5);
  const valueLp = value0 * Math.sqrt(k);
  const ilUsd = valueLp - valueHodl;
  const breakEven = Math.abs(ilPct);
  return {
    priceRatio: Number(k.toFixed(4)),
    ilPercent: Number(ilPct.toFixed(4)),
    ilUsd: Number(ilUsd.toFixed(2)),
    valueHodl: Number(valueHodl.toFixed(2)),
    valueLp: Number(valueLp.toFixed(2)),
    breakEvenFees: Number(breakEven.toFixed(4)),
    explicacion: `Con precio inicial $${p0} y actual $${p1} (ratio ${k.toFixed(3)}): IL = ${ilPct.toFixed(3)}%. LP vale $${valueLp.toFixed(2)} vs HODL $${valueHodl.toFixed(2)}. Necesitás ${breakEven.toFixed(2)}% en fees para break-even.`,
  };
}
