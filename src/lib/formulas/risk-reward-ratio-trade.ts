/** Calculadora de Risk/Reward Ratio (R:R) */
export interface Inputs { precioEntrada: number; precioStop: number; precioTakeProfit: number; tamanoPosicion: number; __lang?: string; }
export interface Outputs { ratio: string; ratioNumero: number; gananciaPotencial: number; perdidaPotencial: number; winrateMinimo: number; evaluacion: string; }
export function riskRewardRatioTrade(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errEntrada: 'Ingresá entrada',
      errStop: 'Ingresá stop',
      errTp: 'Ingresá take-profit',
      errTam: 'Ingresá tamaño',
      errRiesgo: 'Riesgo no puede ser 0',
      evalExcelente: '✅ Excelente — ratio profesional alto',
      evalBueno: '✅ Bueno — cumple estándar 1:2',
      evalMarginal: '⚠️ Marginal — necesita winrate >40%',
      evalDebil: '⚠️ Débil — necesita winrate >50%',
      evalNegativo: '❌ Negativo — descartar trade',
    },
    en: {
      errEntrada: 'Enter entry price',
      errStop: 'Enter stop price',
      errTp: 'Enter take-profit price',
      errTam: 'Enter position size',
      errRiesgo: 'Risk cannot be 0',
      evalExcelente: '✅ Excellent — high professional ratio',
      evalBueno: '✅ Good — meets 1:2 standard',
      evalMarginal: '⚠️ Marginal — needs win rate >40%',
      evalDebil: '⚠️ Weak — needs win rate >50%',
      evalNegativo: '❌ Negative — discard trade',
    },
  } as const)[__lang];
  const ent = Number(i.precioEntrada); const sl = Number(i.precioStop);
  const tp = Number(i.precioTakeProfit); const tam = Number(i.tamanoPosicion);
  if (!ent || ent <= 0) throw new Error(T.errEntrada);
  if (!sl || sl <= 0) throw new Error(T.errStop);
  if (!tp || tp <= 0) throw new Error(T.errTp);
  if (!tam || tam <= 0) throw new Error(T.errTam);
  const riesgo = Math.abs(ent - sl);
  const reward = Math.abs(tp - ent);
  if (riesgo === 0) throw new Error(T.errRiesgo);
  const r = reward / riesgo;
  const winrate = (1 / (1 + r)) * 100;
  let eval_ = '';
  if (r >= 3) eval_ = T.evalExcelente;
  else if (r >= 2) eval_ = T.evalBueno;
  else if (r >= 1.5) eval_ = T.evalMarginal;
  else if (r >= 1) eval_ = T.evalDebil;
  else eval_ = T.evalNegativo;
  return {
    ratio: `1:${r.toFixed(2)}`,
    ratioNumero: Number(r.toFixed(2)),
    gananciaPotencial: Number((reward * tam).toFixed(2)),
    perdidaPotencial: Number((riesgo * tam).toFixed(2)),
    winrateMinimo: Number(winrate.toFixed(1)),
    evaluacion: eval_,
  };
}