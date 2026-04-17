/** Calculadora de Position Size en Acciones */
export interface Inputs { capital: number; riesgoPorcentaje: number; precioEntrada: number; precioStop: number; }
export interface Outputs { acciones: number; capitalInvertido: number; perdidaMaxima: number; porcentajePortfolio: number; resumen: string; }
export function positionSizeStocksPorcentaje(i: Inputs): Outputs {
  const cap = Number(i.capital); const pct = Number(i.riesgoPorcentaje);
  const ent = Number(i.precioEntrada); const stop = Number(i.precioStop);
  if (!cap || cap <= 0) throw new Error('Ingresá el capital');
  if (!pct || pct <= 0) throw new Error('Ingresá el % de riesgo');
  if (!ent || ent <= 0) throw new Error('Ingresá el precio de entrada');
  if (!stop || stop <= 0) throw new Error('Ingresá el precio del stop');
  if (ent === stop) throw new Error('Entrada y stop no pueden ser iguales');
  const riesgo = cap * (pct/100);
  const dist = Math.abs(ent - stop);
  const acc = Math.floor(riesgo / dist);
  const inv = acc * ent;
  return {
    acciones: acc,
    capitalInvertido: Number(inv.toFixed(2)),
    perdidaMaxima: Number((acc * dist).toFixed(2)),
    porcentajePortfolio: Number(((inv/cap)*100).toFixed(1)),
    resumen: `Comprá ${acc} acciones (${inv.toFixed(0)} invertidos, ${((inv/cap)*100).toFixed(1)}% portfolio).`,
  };
}