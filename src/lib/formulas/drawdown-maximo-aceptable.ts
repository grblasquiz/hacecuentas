/** Calculadora de Drawdown Máximo Aceptable */
export interface Inputs { capitalInicial: number; capitalActual: number; retornoMensualPromedio: number; }
export interface Outputs { drawdownPorcentaje: number; recoveryNecesario: number; mesesRecovery: number; categoria: string; resumen: string; _insight?: any; _chart?: any; }
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
  const ddPct = dd * 100;
  const tone = dd < 0.1 ? 'good' : dd < 0.2 ? 'neutral' : 'warn';
  const _insight = {
    title: `Drawdown ${cat}`,
    text: `Tu cuenta está **${ddPct.toFixed(1)}%** abajo del pico. Para volver a estar a la par necesitás recuperar **+${(recovery*100).toFixed(1)}%**, que a tu ritmo de ${ret}% mensual tomaría **~${meses.toFixed(1)} meses**. ${dd < 0.1 ? 'Es un retroceso manejable dentro de lo normal.' : dd < 0.2 ? 'Empezá a vigilar el riesgo: el recovery ya pesa.' : 'Drawdown alto: cada punto extra de caída cuesta exponencialmente más de recuperar.'}`,
    tone,
    icon: dd < 0.1 ? '📈' : '📉',
  };
  const _chart = {
    type: 'scale',
    marker: Number(ddPct.toFixed(2)),
    markerLabel: `${ddPct.toFixed(1)}%`,
    min: 0,
    segments: [
      { nombre: 'Saludable', max: 5, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Normal', max: 10, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Preocupante', max: 20, color: '#ca8a04', colorDark: '#eab308' },
      { nombre: 'Grave', max: 30, color: '#ea580c', colorDark: '#f97316' },
      { nombre: 'Crítico', max: 50, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Extremo', max: Math.max(100, Math.ceil(ddPct) + 1), color: '#7f1d1d', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Drawdown de ${ddPct.toFixed(1)}% sobre una escala de salud de cuenta de 0 a 100%.`,
  };
  return {
    drawdownPorcentaje: Number(ddPct.toFixed(2)),
    recoveryNecesario: Number((recovery * 100).toFixed(2)),
    mesesRecovery: Number(meses.toFixed(1)),
    categoria: cat,
    resumen: `Drawdown ${ddPct.toFixed(1)}% — necesitás +${(recovery*100).toFixed(1)}% y ~${meses.toFixed(1)} meses para recuperar.`,
    _insight,
    _chart,
  };
}