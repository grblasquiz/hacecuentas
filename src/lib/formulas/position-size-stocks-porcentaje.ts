/** Calculadora de Position Size en Acciones */
export interface Inputs { capital: number; riesgoPorcentaje: number; precioEntrada: number; precioStop: number; __lang?: string; }
export interface Outputs { acciones: number; capitalInvertido: number; perdidaMaxima: number; porcentajePortfolio: number; resumen: string; }
export function positionSizeStocksPorcentaje(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errCapital: 'Ingresá el capital',
      errRiesgo: 'Ingresá el % de riesgo',
      errEntrada: 'Ingresá el precio de entrada',
      errStop: 'Ingresá el precio del stop',
      errIguales: 'Entrada y stop no pueden ser iguales',
    },
    en: {
      errCapital: 'Enter the capital',
      errRiesgo: 'Enter the risk %',
      errEntrada: 'Enter the entry price',
      errStop: 'Enter the stop price',
      errIguales: 'Entry and stop cannot be the same',
    },
  } as const)[__lang];
  const cap = Number(i.capital); const pct = Number(i.riesgoPorcentaje);
  const ent = Number(i.precioEntrada); const stop = Number(i.precioStop);
  if (!cap || cap <= 0) throw new Error(T.errCapital);
  if (!pct || pct <= 0) throw new Error(T.errRiesgo);
  if (!ent || ent <= 0) throw new Error(T.errEntrada);
  if (!stop || stop <= 0) throw new Error(T.errStop);
  if (ent === stop) throw new Error(T.errIguales);
  const riesgo = cap * (pct/100);
  const dist = Math.abs(ent - stop);
  const acc = Math.floor(riesgo / dist);
  const inv = acc * ent;
  return {
    acciones: acc,
    capitalInvertido: Number(inv.toFixed(2)),
    perdidaMaxima: Number((acc * dist).toFixed(2)),
    porcentajePortfolio: Number(((inv/cap)*100).toFixed(1)),
    resumen: __lang === 'en'
      ? `Buy ${acc} shares (${inv.toFixed(0)} invested, ${((inv/cap)*100).toFixed(1)}% of portfolio).`
      : `Comprá ${acc} acciones (${inv.toFixed(0)} invertidos, ${((inv/cap)*100).toFixed(1)}% portfolio).`,
  };
}