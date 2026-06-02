/** Calculadora de Position Size en Acciones */
export interface Inputs { capital: number; riesgoPorcentaje: number; precioEntrada: number; precioStop: number; __lang?: string; }
export interface Outputs { acciones: number; capitalInvertido: number; perdidaMaxima: number; porcentajePortfolio: number; resumen: string; _insight?: any; _chart?: any; }
export function positionSizeStocksPorcentaje(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errCapital: 'Ingresá el capital',
      errRiesgo: 'Ingresá el % de riesgo',
      errEntrada: 'Ingresá el precio de entrada',
      errStop: 'Ingresá el precio del stop',
      errIguales: 'Entrada y stop no pueden ser iguales',
      insTitle: 'Tu riesgo en este trade',
      insRiesgo: 'Si salta el stop perdés',
      insDe: 'de tu capital. La posición usa',
      insPortfolio: 'del portfolio',
      insWarnPct: '— concentración alta en un solo trade.',
      insGoodPct: '— concentración prudente.',
      gMarker: 'del portfolio',
      gConserv: 'Conservador',
      gModerado: 'Moderado',
      gAgresivo: 'Agresivo',
      gExcesivo: 'Excesivo',
      gAria: 'Concentración de la posición sobre el capital total',
    },
    en: {
      errCapital: 'Enter the capital',
      errRiesgo: 'Enter the risk %',
      errEntrada: 'Enter the entry price',
      errStop: 'Enter the stop price',
      errIguales: 'Entry and stop cannot be the same',
      insTitle: 'Your risk on this trade',
      insRiesgo: 'If the stop is hit you lose',
      insDe: 'of your capital. The position uses',
      insPortfolio: 'of the portfolio',
      insWarnPct: '— high concentration in a single trade.',
      insGoodPct: '— prudent concentration.',
      gMarker: 'of portfolio',
      gConserv: 'Conservative',
      gModerado: 'Moderate',
      gAgresivo: 'Aggressive',
      gExcesivo: 'Excessive',
      gAria: 'Position concentration over total capital',
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
  const perdida = Number((acc * dist).toFixed(2));
  const portPct = Number(((inv/cap)*100).toFixed(1));
  const tone = portPct >= 25 ? 'warn' : 'good';
  return {
    acciones: acc,
    capitalInvertido: Number(inv.toFixed(2)),
    perdidaMaxima: perdida,
    porcentajePortfolio: portPct,
    resumen: __lang === 'en'
      ? `Buy ${acc} shares (${inv.toFixed(0)} invested, ${portPct}% of portfolio).`
      : `Comprá ${acc} acciones (${inv.toFixed(0)} invertidos, ${portPct}% portfolio).`,
    _insight: {
      title: T.insTitle,
      text: `${T.insRiesgo} **${perdida.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR', { maximumFractionDigits: 0 })}** (${pct}%) ${T.insDe} **${portPct}% ${T.insPortfolio}** ${tone === 'warn' ? T.insWarnPct : T.insGoodPct}`,
      tone,
      icon: '🎯',
    },
    _chart: {
      type: 'scale',
      marker: portPct,
      markerLabel: `${portPct}% ${T.gMarker}`,
      min: 0,
      unit: '%',
      segments: [
        { nombre: T.gConserv, max: 10, color: '#bbf7d0', colorDark: '#166534' },
        { nombre: T.gModerado, max: 25, color: '#fde68a', colorDark: '#b45309' },
        { nombre: T.gAgresivo, max: 50, color: '#fed7aa', colorDark: '#9a3412' },
        { nombre: T.gExcesivo, max: Math.max(100, Math.ceil(portPct) + 1), color: '#fecaca', colorDark: '#b91c1c' },
      ],
      ariaLabel: T.gAria,
    },
  };
}