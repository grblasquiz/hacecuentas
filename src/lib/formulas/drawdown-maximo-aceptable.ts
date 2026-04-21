/** Calculadora de Drawdown Máximo Aceptable */
export interface Inputs { capitalInicial: number; capitalActual: number; retornoMensualPromedio: number; }
export interface Outputs { drawdownPorcentaje: number; recoveryNecesario: number; mesesRecovery: number; categoria: string; resumen: string; }
export function drawdownMaximoAceptable(i: Inputs): Outputs {
  const ini = Number(i.capitalInicial); const act = Number(i.capitalActual);
  const ret = Number(i.retornoMensualPromedio);
  if (!ini || ini <= 0) throw new Error('Ingresá capital inicial');
  if (!act || act <= 0) throw new Error('Ingresá capital actual');
  if (act > ini) throw new Error('El capital actual no debería superar el inicial (sin drawdown)');
  if (!ret || ret <= 0) throw new Error('Ingresá retorno mensual (%)');
  const dd = (ini - act) / ini;
  const recovery = dd / (1 - dd);
  const meses = Math.log(1 + recovery) / Math.log(1 + ret / 100);
  let cat = '';
  if (dd < 0.05) cat = '✅ Saludable';
  else if (dd < 0.1) cat = '✅ Normal';
  else if (dd < 0.2) cat = '⚠️ Preocupante';
  else if (dd < 0.3) cat = '⚠️ Grave';
  else if (dd < 0.5) cat = '❌ Crítico';
  else cat = '☠️ Extremo';
  return {
    drawdownPorcentaje: Number((dd * 100).toFixed(2)),
    recoveryNecesario: Number((recovery * 100).toFixed(2)),
    mesesRecovery: Number(meses.toFixed(1)),
    categoria: cat,
    resumen: `Drawdown ${(dd*100).toFixed(1)}% — necesitás +${(recovery*100).toFixed(1)}% y ~${meses.toFixed(1)} meses para recuperar.`,
  };
}