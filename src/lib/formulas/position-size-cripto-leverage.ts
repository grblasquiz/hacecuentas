/** Calculadora de Position Size en Cripto (con leverage) */
export interface Inputs { capital: number; riesgoPorcentaje: number; precioEntrada: number; precioStop: number; leverage: number; }
export interface Outputs { tamanoPosicionUSD: number; unidades: number; margenRequerido: number; precioLiquidacion: number; riesgoUSD: number; resumen: string; }
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
  return {
    tamanoPosicionUSD: Number(tam.toFixed(2)),
    unidades: Number(uds.toFixed(6)),
    margenRequerido: Number(marg.toFixed(2)),
    precioLiquidacion: Number(liq.toFixed(2)),
    riesgoUSD: Number(riesgo.toFixed(2)),
    resumen: `Abrí ${uds.toFixed(4)} unidades (${tam.toFixed(0)} USDT). Margen ${marg.toFixed(0)}. Liq ~${liq.toFixed(0)}.`,
  };
}