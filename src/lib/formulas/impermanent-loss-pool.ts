/** Impermanent loss for 50/50 pool */
export interface Inputs { initialPrice: number; currentPrice: number; initialAmountUsd: number; }
export interface Outputs { priceRatio: number; ilPercent: number; ilUsd: number; valueHodl: number; valueLp: number; breakEvenFees: number; explicacion: string; _chart?: any; _insight?: any; }
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
  // Gauge de severidad del IL (valor absoluto), umbrales DeFi habituales.
  const ilMarker = Number(breakEven.toFixed(2));
  const chart = {
    type: 'scale' as const,
    marker: ilMarker,
    markerLabel: `IL: ${ilMarker}%`,
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Mínima', max: 1, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Moderada', max: 5, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Alta', max: 15, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Severa', max: Math.max(25, Math.ceil(ilMarker) + 2), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Severidad de la pérdida impermanente: ${ilMarker}% respecto a holdear.`,
  };
  const insight = {
    title: ilMarker < 1 ? 'Pérdida impermanente baja' : 'Pérdida impermanente a vigilar',
    text: `El precio se movió **${k.toFixed(2)}x** y generó **${breakEven.toFixed(2)}%** de pérdida impermanente: en el LP tenés **$${valueLp.toFixed(2)}** frente a **$${valueHodl.toFixed(2)}** holdeando (**$${Math.abs(ilUsd).toFixed(2)}** de diferencia). Necesitás acumular **${breakEven.toFixed(2)}%** en comisiones para empatar.`,
    tone: ilMarker < 1 ? 'good' : 'warn',
    icon: '💧',
  };
  return {
    priceRatio: Number(k.toFixed(4)),
    ilPercent: Number(ilPct.toFixed(4)),
    ilUsd: Number(ilUsd.toFixed(2)),
    valueHodl: Number(valueHodl.toFixed(2)),
    valueLp: Number(valueLp.toFixed(2)),
    breakEvenFees: Number(breakEven.toFixed(4)),
    explicacion: `Con precio inicial $${p0} y actual $${p1} (ratio ${k.toFixed(3)}): IL = ${ilPct.toFixed(3)}%. LP vale $${valueLp.toFixed(2)} vs HODL $${valueHodl.toFixed(2)}. Necesitás ${breakEven.toFixed(2)}% en fees para break-even.`,
    _chart: chart,
    _insight: insight,
  };
}
