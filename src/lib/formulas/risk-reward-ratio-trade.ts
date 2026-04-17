/** Calculadora de Risk/Reward Ratio (R:R) */
export interface Inputs { precioEntrada: number; precioStop: number; precioTakeProfit: number; tamanoPosicion: number; }
export interface Outputs { ratio: string; ratioNumero: number; gananciaPotencial: number; perdidaPotencial: number; winrateMinimo: number; evaluacion: string; }
export function riskRewardRatioTrade(i: Inputs): Outputs {
  const ent = Number(i.precioEntrada); const sl = Number(i.precioStop);
  const tp = Number(i.precioTakeProfit); const tam = Number(i.tamanoPosicion);
  if (!ent || ent <= 0) throw new Error('Ingresá entrada');
  if (!sl || sl <= 0) throw new Error('Ingresá stop');
  if (!tp || tp <= 0) throw new Error('Ingresá take-profit');
  if (!tam || tam <= 0) throw new Error('Ingresá tamaño');
  const riesgo = Math.abs(ent - sl);
  const reward = Math.abs(tp - ent);
  if (riesgo === 0) throw new Error('Riesgo no puede ser 0');
  const r = reward / riesgo;
  const winrate = (1 / (1 + r)) * 100;
  let eval_ = '';
  if (r >= 3) eval_ = '✅ Excelente — ratio profesional alto';
  else if (r >= 2) eval_ = '✅ Bueno — cumple estándar 1:2';
  else if (r >= 1.5) eval_ = '⚠️ Marginal — necesita winrate >40%';
  else if (r >= 1) eval_ = '⚠️ Débil — necesita winrate >50%';
  else eval_ = '❌ Negativo — descartar trade';
  return {
    ratio: `1:${r.toFixed(2)}`,
    ratioNumero: Number(r.toFixed(2)),
    gananciaPotencial: Number((reward * tam).toFixed(2)),
    perdidaPotencial: Number((riesgo * tam).toFixed(2)),
    winrateMinimo: Number(winrate.toFixed(1)),
    evaluacion: eval_,
  };
}