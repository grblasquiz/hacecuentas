/** Fondo de emergencia: cuánto ahorrar según gastos mensuales × meses objetivo */
export interface Inputs {
  gastosMensuales: number;
  mesesObjetivo: number;
  ahorroActual?: number;
  aporteMensual?: number;
}
export interface Outputs {
  fondoObjetivo: number;
  faltaAhorrar: number;
  mesesHastaMeta: number;
  cobertura: string;
  recomendacion: string;
  resumen: string;
}

export function fondoEmergenciaMeses(i: Inputs): Outputs {
  const gastos = Number(i.gastosMensuales);
  const meses = Number(i.mesesObjetivo);
  const actual = Number(i.ahorroActual) || 0;
  const aporte = Number(i.aporteMensual) || 0;

  if (!gastos || gastos <= 0) throw new Error('Ingresá tus gastos mensuales');
  if (!meses || meses <= 0) throw new Error('Ingresá los meses objetivo (típico 3-6)');
  if (actual < 0) throw new Error('El ahorro actual no puede ser negativo');

  const fondoObjetivo = gastos * meses;
  const falta = Math.max(fondoObjetivo - actual, 0);
  const mesesHastaMeta = aporte > 0 ? falta / aporte : 0;

  const mesesCubiertos = actual / gastos;
  let cobertura = '';
  if (mesesCubiertos >= meses) cobertura = `Ya tenés ${mesesCubiertos.toFixed(1)} meses de cobertura. Meta alcanzada.`;
  else if (mesesCubiertos >= 3) cobertura = `Tenés ${mesesCubiertos.toFixed(1)} meses cubiertos. Base mínima lograda, seguí sumando.`;
  else if (mesesCubiertos >= 1) cobertura = `Solo ${mesesCubiertos.toFixed(1)} meses de cobertura. Acelerá el ahorro.`;
  else cobertura = 'Tenés menos de un mes de gastos cubierto. Priorizá armar el fondo antes que otras inversiones.';

  let recomendacion = '';
  if (meses <= 3) recomendacion = '3 meses es el mínimo recomendado si tenés ingresos estables.';
  else if (meses <= 6) recomendacion = '6 meses es el estándar para la mayoría de familias y monotributistas.';
  else recomendacion = '9-12 meses aplica si sos freelancer, autónomo o tu ingreso es muy variable.';

  const resumen = `Necesitás ${fondoObjetivo.toLocaleString()} para cubrir ${meses} meses de gastos. ${falta > 0 ? `Te faltan ${falta.toLocaleString()}.` : 'Ya tenés el fondo completo.'}`;

  return {
    fondoObjetivo: Math.round(fondoObjetivo),
    faltaAhorrar: Math.round(falta),
    mesesHastaMeta: Number(mesesHastaMeta.toFixed(1)),
    cobertura,
    recomendacion,
    resumen,
  };
}
