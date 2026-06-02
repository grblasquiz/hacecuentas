/** Calculadora de Position Size Forex (pips y riesgo) */
export interface Inputs { capital: number; riesgoPorcentaje: number; stopLossPips: number; valorPipPorLote: number; }
export interface Outputs { riesgoUSD: number; lotesEstandar: number; lotesMini: number; lotesMicro: number; unidades: number; resumen: string; _insight?: any; }
export function positionSizeForexPipsRiesgo(i: Inputs): Outputs {
  const capital = Number(i.capital); const pct = Number(i.riesgoPorcentaje);
  const stop = Number(i.stopLossPips); const vp = Number(i.valorPipPorLote);
  if (!capital || capital <= 0) throw new Error('Ingresá el capital');
  if (!pct || pct <= 0) throw new Error('Ingresá el % de riesgo');
  if (!stop || stop <= 0) throw new Error('Ingresá el stop-loss');
  if (!vp || vp <= 0) throw new Error('Ingresá el valor del pip');
  const riesgoUSD = capital * (pct / 100);
  const le = riesgoUSD / (stop * vp);
  // Regla clásica de gestión de riesgo: ≤1-2% por operación
  const tone = pct > 2 ? 'warn' : 'good';
  const _insight = {
    title: 'Lotaje y riesgo por operación',
    text: pct > 2
      ? `Arriesgar **${pct}%** (${riesgoUSD.toFixed(2)} USD) por trade está por encima del 1-2% que recomienda la gestión de riesgo: con **${le.toFixed(2)} lotes estándar** y un stop de **${stop} pips**, una racha de pérdidas pega fuerte en tu capital.`
      : `Con **${le.toFixed(2)} lotes estándar** (${le >= 1 ? `${le.toFixed(2)} std` : `${(le*100).toFixed(0)} micro`}) y un stop de **${stop} pips**, tu pérdida máxima es **${riesgoUSD.toFixed(2)} USD** = solo el ${pct}% del capital. Riesgo bajo control: respetá el stop y mantené el tamaño.`,
    tone,
    icon: tone === 'warn' ? '⚠️' : '🎯',
  };
  return {
    riesgoUSD: Number(riesgoUSD.toFixed(2)),
    lotesEstandar: Number(le.toFixed(3)),
    lotesMini: Number((le*10).toFixed(2)),
    lotesMicro: Number((le*100).toFixed(1)),
    unidades: Math.round(le * 100000),
    resumen: `Con ${capital.toLocaleString()} USD y ${pct}% operá ${le.toFixed(2)} lotes estándar. Pérdida máx: ${riesgoUSD.toFixed(2)} USD.`,
    _insight,
  };
}