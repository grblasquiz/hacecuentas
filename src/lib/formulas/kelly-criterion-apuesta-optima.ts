/** Calculadora de Kelly Criterion (apuesta óptima) */
export interface Inputs { winrate: number; gananciaPromedio: number; perdidaPromedio: number; capital: number; }
export interface Outputs { kellyPorcentaje: number; halfKelly: number; quarterKelly: number; montoOptimo: number; evaluacion: string; }
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
  return {
    kellyPorcentaje: Number(kPct.toFixed(2)),
    halfKelly: Number(half.toFixed(2)),
    quarterKelly: Number((kPct/4).toFixed(2)),
    montoOptimo: Number(((half/100) * cap).toFixed(2)),
    evaluacion: eval_,
  };
}