/** Calculadora de Risk/Reward Ratio (R:R) */
export interface Inputs { precioEntrada: number; precioStop: number; precioTakeProfit: number; tamanoPosicion: number; __lang?: string; }
export interface Outputs { ratio: string; ratioNumero: number; gananciaPotencial: number; perdidaPotencial: number; winrateMinimo: number; evaluacion: string; _insight?: any; _chart?: any; }
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
      insTitle: 'Tu relación riesgo/beneficio',
      insGood: (r: string, w: string, g: string, p: string) => `Arriesgás **${p}** para ganar **${g}**: un R:R de **1:${r}**. Te alcanza con acertar más del **${w}%** de las veces para no perder plata en el largo plazo.`,
      insWarn: (r: string, w: string, g: string, p: string) => `Arriesgás **${p}** para ganar **${g}**: un R:R de **1:${r}**. Necesitás un winrate alto (más del **${w}%**) para que el trade dé positivo. Apuntá a 1:2 o mejor.`,
      chartLabel: (r: string) => 'R:R 1:' + r,
      chartAria: (r: string) => 'Escala de riesgo/beneficio: tu ratio es 1:' + r,
      zPoor: 'Pobre', zWeak: 'Débil', zOk: 'Estándar', zGreat: 'Excelente',
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
      insTitle: 'Your risk/reward ratio',
      insGood: (r: string, w: string, g: string, p: string) => `You risk **${p}** to make **${g}**: an R:R of **1:${r}**. You only need to be right more than **${w}%** of the time to come out ahead long-term.`,
      insWarn: (r: string, w: string, g: string, p: string) => `You risk **${p}** to make **${g}**: an R:R of **1:${r}**. You need a high win rate (over **${w}%**) for this trade to pay off. Aim for 1:2 or better.`,
      chartLabel: (r: string) => 'R:R 1:' + r,
      chartAria: (r: string) => 'Risk/reward scale: your ratio is 1:' + r,
      zPoor: 'Poor', zWeak: 'Weak', zOk: 'Standard', zGreat: 'Excellent',
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
  const rStr = r.toFixed(2);
  const wStr = winrate.toFixed(1);
  const cur = __lang === 'en' ? 'en-US' : 'es-AR';
  const gStr = '$' + Number((reward * tam).toFixed(2)).toLocaleString(cur);
  const pStr = '$' + Number((riesgo * tam).toFixed(2)).toLocaleString(cur);
  const favorable = r >= 2;
  const _insight = {
    title: T.insTitle,
    text: favorable ? T.insGood(rStr, wStr, gStr, pStr) : T.insWarn(rStr, wStr, gStr, pStr),
    tone: favorable ? 'good' : 'warn',
    icon: '⚖️',
  };
  const _chart = {
    type: 'scale' as const,
    marker: Number(rStr),
    markerLabel: T.chartLabel(rStr),
    min: 0,
    segments: [
      { nombre: T.zPoor, max: 1, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: T.zWeak, max: 1.5, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: T.zOk, max: 3, color: '#d9f99d', colorDark: '#4d7c0f' },
      { nombre: T.zGreat, max: Math.max(4, Math.ceil(r) + 1), color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: T.chartAria(rStr),
  };
  return {
    ratio: `1:${rStr}`,
    ratioNumero: Number(rStr),
    gananciaPotencial: Number((reward * tam).toFixed(2)),
    perdidaPotencial: Number((riesgo * tam).toFixed(2)),
    winrateMinimo: Number(winrate.toFixed(1)),
    evaluacion: eval_,
    _insight,
    _chart,
  };
}