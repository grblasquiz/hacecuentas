/** Calculadora de Kelly Criterion (apuesta óptima) */
export interface Inputs { winrate: number; gananciaPromedio: number; perdidaPromedio: number; capital: number; }
export interface Outputs { kellyPorcentaje: number; halfKelly: number; quarterKelly: number; montoOptimo: number; evaluacion: string; _insight?: any; _chart?: any; }
export function kellyCriterionApuestaOptima(i: Inputs): Outputs {
  const wr = Number(i.winrate); const gp = Number(i.gananciaPromedio);
  const pp = Number(i.perdidaPromedio); const cap = Number(i.capital);
  if (!wr || wr <= 0 || wr >= 100) throw new Error('Winrate entre 0 y 100');
  if (!gp || gp <= 0) throw new Error('Ingresá ganancia promedio');
  if (!pp || pp <= 0) throw new Error('Ingresá pérdida promedio');
  if (!cap || cap <= 0) throw new Error('Ingresá capital');
  const p = wr / 100; const q = 1 - p;
  const b = gp / pp;
  const k = ((b * p) - q) / b;
  const kPct = k * 100;
  let eval_ = '';
  if (k <= 0) eval_ = '❌ Sin edge — no apostar';
  else if (kPct < 5) eval_ = '⚠️ Edge mínimo — usar ¼ Kelly';
  else if (kPct < 20) eval_ = '✅ Edge razonable — ½ Kelly recomendado';
  else if (kPct < 40) eval_ = '✅ Edge fuerte — ½ Kelly o menos';
  else eval_ = '⚠️ Edge alto — revisar si winrate es realista';
  const half = Math.max(0, kPct / 2);
  const montoOpt = (half / 100) * cap;
  const tone = k <= 0 ? 'warn' : (kPct >= 40 ? 'warn' : 'good');
  const insightText = k <= 0
    ? `Con un winrate de **${wr}%** y un ratio ganancia/pérdida de **${b.toFixed(2)}**, Kelly da **${kPct.toFixed(1)}%**: no hay edge matemático, lo óptimo es **no apostar**.`
    : `Kelly puro sugiere arriesgar **${kPct.toFixed(1)}%** del capital por operación, pero lo prudente es ½ Kelly: **${half.toFixed(1)}%** (≈ AR$ ${Math.round(montoOpt).toLocaleString('es-AR')}). El ratio ganancia/pérdida es **${b.toFixed(2)}**.`;
  const markerVal = Number(kPct.toFixed(2));
  const segMin = Math.min(0, Math.floor(markerVal));
  const topMax = Math.max(45, markerVal + 5);
  return {
    kellyPorcentaje: markerVal,
    halfKelly: Number(half.toFixed(2)),
    quarterKelly: Number((kPct/4).toFixed(2)),
    montoOptimo: Number(montoOpt.toFixed(2)),
    evaluacion: eval_,
    _insight: {
      title: 'Lectura del edge',
      text: insightText,
      tone,
      icon: '🎲',
    },
    _chart: {
      type: 'scale',
      marker: markerVal,
      markerLabel: `Kelly ${kPct.toFixed(1)}%`,
      min: segMin,
      segments: [
        { nombre: 'Sin edge', max: 0, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Mínimo', max: 5, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Razonable', max: 20, color: '#10b981', colorDark: '#059669' },
        { nombre: 'Fuerte', max: 40, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Demasiado alto', max: topMax, color: '#f59e0b', colorDark: '#d97706' },
      ],
      ariaLabel: `Fracción de Kelly ${kPct.toFixed(1)}% sobre la escala de edge`,
    },
  };
}