/** Calculadora de Position Size Forex (pips y riesgo) */
export interface Inputs { capital: number; riesgoPorcentaje: number; stopLossPips: number; valorPipPorLote: number; }
export interface Outputs { riesgoUSD: number; lotesEstandar: number; lotesMini: number; lotesMicro: number; unidades: number; resumen: string; }
export function positionSizeForexPipsRiesgo(i: Inputs): Outputs {
  const capital = Number(i.capital); const pct = Number(i.riesgoPorcentaje);
  const stop = Number(i.stopLossPips); const vp = Number(i.valorPipPorLote);
  if (!capital || capital <= 0) throw new Error('Ingresá el capital');
  if (!pct || pct <= 0) throw new Error('Ingresá el % de riesgo');
  if (!stop || stop <= 0) throw new Error('Ingresá el stop-loss');
  if (!vp || vp <= 0) throw new Error('Ingresá el valor del pip');
  const riesgoUSD = capital * (pct / 100);
  const le = riesgoUSD / (stop * vp);
  return {
    riesgoUSD: Number(riesgoUSD.toFixed(2)),
    lotesEstandar: Number(le.toFixed(3)),
    lotesMini: Number((le*10).toFixed(2)),
    lotesMicro: Number((le*100).toFixed(1)),
    unidades: Math.round(le * 100000),
    resumen: `Con ${capital.toLocaleString()} USD y ${pct}% operá ${le.toFixed(2)} lotes estándar. Pérdida máx: ${riesgoUSD.toFixed(2)} USD.`,
  };
}