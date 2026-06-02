/** Calculadora de Position Size en Cripto (con leverage) */
export interface Inputs { capital: number; riesgoPorcentaje: number; precioEntrada: number; precioStop: number; leverage: number; }
export interface Outputs { tamanoPosicionUSD: number; unidades: number; margenRequerido: number; precioLiquidacion: number; riesgoUSD: number; resumen: string; _insight?: any; }
export function positionSizeCriptoLeverage(i: Inputs): Outputs {
  const cap = Number(i.capital); const pct = Number(i.riesgoPorcentaje);
  const ent = Number(i.precioEntrada); const stop = Number(i.precioStop);
  const lev = Number(i.leverage);
  if (!cap || cap <= 0) throw new Error('Ingresá el capital');
  if (!pct || pct <= 0) throw new Error('Ingresá el % de riesgo');
  if (!ent || ent <= 0) throw new Error('Ingresá precio de entrada');
  if (!stop || stop <= 0) throw new Error('Ingresá precio de stop');
  if (!lev || lev <= 0) throw new Error('Ingresá el leverage');
  if (ent === stop) throw new Error('Entrada y stop distintos');
  const riesgo = cap * (pct/100);
  const dist = Math.abs(ent - stop);
  const uds = riesgo / dist;
  const tam = uds * ent;
  const marg = tam / lev;
  const isLong = ent > stop;
  const liq = isLong ? ent * (1 - 0.95/lev) : ent * (1 + 0.95/lev);
  // ¿La liquidación queda ANTES que el stop? (peligro: te liquidan sin que toque tu stop)
  const liqAntesDelStop = isLong ? liq > stop : liq < stop;
  const distStopPct = (dist / ent) * 100;
  const _insight = {
    title: 'Tamaño y riesgo de la posición',
    text: liqAntesDelStop
      ? `⚠️ Con **${lev}x** tu precio de liquidación (~${liq.toFixed(0)}) queda **antes** que tu stop (${stop.toFixed(0)}): el exchange te liquidaría antes de que el stop te proteja. Bajá el leverage o acercá el stop.`
      : `Arriesgás **${riesgo.toFixed(0)} USDT** (${pct}% del capital) en una posición de **${tam.toFixed(0)} USDT** con margen de solo **${marg.toFixed(0)} USDT** gracias al ${lev}x. Tu stop está a ${distStopPct.toFixed(1)}% del precio y la liquidación a ~${liq.toFixed(0)}: respetá el stop para no llegar ahí.`,
    tone: 'warn',
    icon: '⚡',
  };
  return {
    tamanoPosicionUSD: Number(tam.toFixed(2)),
    unidades: Number(uds.toFixed(6)),
    margenRequerido: Number(marg.toFixed(2)),
    precioLiquidacion: Number(liq.toFixed(2)),
    riesgoUSD: Number(riesgo.toFixed(2)),
    resumen: `Abrí ${uds.toFixed(4)} unidades (${tam.toFixed(0)} USDT). Margen ${marg.toFixed(0)}. Liq ~${liq.toFixed(0)}.`,
    _insight,
  };
}