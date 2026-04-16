/** Monto ideal para fondo de emergencia según gastos y situación */

export interface Inputs {
  gastosMensuales: number;
  mesesObjetivo: number;
  ingresoVariable: string;
  dependientes: number;
  fondoActual: number;
}

export interface Outputs {
  fondoIdeal: number;
  mesesCubiertos: number;
  faltante: number;
  ahorroMensualSugerido: number;
  mesesParaCompletarlo: number;
  formula: string;
  explicacion: string;
}

export function fondoEmergenciaMeses(i: Inputs): Outputs {
  const gastos = Number(i.gastosMensuales);
  let mesesObj = Number(i.mesesObjetivo) || 0;
  const ingresoVar = i.ingresoVariable === 'si' || i.ingresoVariable === 'true';
  const dependientes = Number(i.dependientes) || 0;
  const fondoActual = Number(i.fondoActual) || 0;

  if (!gastos || gastos <= 0) throw new Error('Ingresá tus gastos mensuales');

  // Si no especificó meses, calcular según situación
  if (mesesObj <= 0) {
    mesesObj = 6;
    if (ingresoVar) mesesObj += 3;
    if (dependientes > 0) mesesObj += dependientes;
    mesesObj = Math.min(12, mesesObj);
  }

  const fondoIdeal = gastos * mesesObj;
  const mesesCubiertos = fondoActual > 0 ? fondoActual / gastos : 0;
  const faltante = Math.max(0, fondoIdeal - fondoActual);

  // Sugerencia: ahorrar el 20% de gastos para el fondo
  const ahorroSugerido = gastos * 0.20;
  const mesesParaCompletarlo = ahorroSugerido > 0 && faltante > 0 ? Math.ceil(faltante / ahorroSugerido) : 0;

  const formula = `Fondo ideal = $${gastos.toLocaleString()} × ${mesesObj} meses = $${fondoIdeal.toLocaleString()}`;
  const explicacion = `Gastos mensuales: $${gastos.toLocaleString()}. Fondo de emergencia recomendado: ${mesesObj} meses = $${fondoIdeal.toLocaleString()} (${ingresoVar ? 'ingreso variable +3' : 'ingreso fijo'}${dependientes > 0 ? `, ${dependientes} dependiente(s) +${dependientes}` : ''}).${fondoActual > 0 ? ` Fondo actual: $${fondoActual.toLocaleString()} (${mesesCubiertos.toFixed(1)} meses cubiertos).` : ''} ${faltante > 0 ? `Faltante: $${faltante.toLocaleString()}. Ahorrando $${Math.round(ahorroSugerido).toLocaleString()}/mes (20% de gastos), lo completás en ${mesesParaCompletarlo} meses.` : 'Ya tenés tu fondo de emergencia completo.'}`;

  return {
    fondoIdeal: Math.round(fondoIdeal),
    mesesCubiertos: Number(mesesCubiertos.toFixed(1)),
    faltante: Math.round(faltante),
    ahorroMensualSugerido: Math.round(ahorroSugerido),
    mesesParaCompletarlo,
    formula,
    explicacion,
  };
}
