/** Monto ideal para fondo de emergencia según gastos y situación */

export interface Inputs {
  gastosMensuales: number;
  mesesObjetivo: number;
  ingresoVariable?: string;
  dependientes?: number;
  fondoActual?: number;
  ahorroActual?: number;
  aporteMensual?: number;
}

export interface Outputs {
  fondoIdeal: number;
  fondoObjetivo: number;
  mesesCubiertos: number;
  faltante: number;
  faltaAhorrar: number;
  ahorroMensualSugerido: number;
  mesesParaCompletarlo: number;
  mesesHastaMeta: number;
  cobertura: string;
  recomendacion: string;
  formula: string;
  explicacion: string;
  resumen: string;
  _chart?: any;
  _insight?: any;
}

export function fondoEmergenciaMeses(i: Inputs): Outputs {
  const gastos = Number(i.gastosMensuales);
  let mesesObj = Number(i.mesesObjetivo) || 0;
  const ingresoVar = i.ingresoVariable === 'si' || i.ingresoVariable === 'true';
  const dependientes = Number(i.dependientes) || 0;
  // Aceptar tanto fondoActual como ahorroActual (alias compatible con el JSON)
  const fondoActual = Number(i.fondoActual ?? i.ahorroActual) || 0;
  const aporteMensual = Number(i.aporteMensual) || 0;

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
  // Usar el aporte real del usuario si lo ingresó; si no, el 20%
  const aporteEfectivo = aporteMensual > 0 ? aporteMensual : ahorroSugerido;
  const mesesParaCompletarlo = aporteEfectivo > 0 && faltante > 0
    ? Math.ceil(faltante / aporteEfectivo)
    : 0;

  // Cobertura textual
  let cobertura = '';
  if (fondoActual <= 0) {
    cobertura = 'No tenés fondo todavía. Empezá hoy mismo apartando un monto pequeño.';
  } else if (mesesCubiertos < 1) {
    cobertura = `Tu fondo cubre menos de 1 mes (${mesesCubiertos.toFixed(1)} meses). Estás en zona de riesgo.`;
  } else if (mesesCubiertos < mesesObj * 0.5) {
    cobertura = `Cubrís ${mesesCubiertos.toFixed(1)} meses, menos de la mitad de tu meta. Acelerá el ahorro.`;
  } else if (mesesCubiertos < mesesObj) {
    cobertura = `Cubrís ${mesesCubiertos.toFixed(1)} meses de los ${mesesObj} objetivo. Vas por buen camino.`;
  } else {
    cobertura = `Tu fondo cubre ${mesesCubiertos.toFixed(1)} meses, por encima de la meta de ${mesesObj}. Excelente.`;
  }

  // Recomendación textual
  let recomendacion = '';
  if (faltante <= 0) {
    recomendacion = 'Fondo completo. Mantenelo en instrumentos líquidos (caja de ahorro, money market, T-Bills) y empezá a invertir el excedente.';
  } else if (mesesCubiertos < 1) {
    recomendacion = `Tu prioridad #1 es alcanzar 1 mes de gastos ($${gastos.toLocaleString()}). Apartá lo que puedas hasta llegar ahí.`;
  } else if (mesesCubiertos < 3) {
    recomendacion = `Apuntá a 3 meses como base mínima. Te faltan $${faltante.toLocaleString()}. Con $${Math.round(aporteEfectivo).toLocaleString()}/mes llegás en ${mesesParaCompletarlo} meses.`;
  } else {
    recomendacion = `Te faltan $${faltante.toLocaleString()} para completar ${mesesObj} meses. Mantené el ritmo de $${Math.round(aporteEfectivo).toLocaleString()}/mes y lo completás en ${mesesParaCompletarlo} meses.`;
  }

  const formula = `Fondo ideal = $${gastos.toLocaleString()} × ${mesesObj} meses = $${fondoIdeal.toLocaleString()}`;
  const explicacion = `Gastos mensuales: $${gastos.toLocaleString()}. Fondo de emergencia recomendado: ${mesesObj} meses = $${fondoIdeal.toLocaleString()}${ingresoVar ? ' (ingreso variable +3 meses)' : ''}${dependientes > 0 ? ` (${dependientes} dependiente(s) +${dependientes} meses)` : ''}.${fondoActual > 0 ? ` Fondo actual: $${fondoActual.toLocaleString()} (${mesesCubiertos.toFixed(1)} meses cubiertos).` : ''} ${faltante > 0 ? `Faltante: $${faltante.toLocaleString()}. Ahorrando $${Math.round(aporteEfectivo).toLocaleString()}/mes, lo completás en ${mesesParaCompletarlo} meses.` : 'Ya tenés tu fondo de emergencia completo.'}`;

  const resumen = faltante > 0
    ? `Necesitás $${Math.round(fondoIdeal).toLocaleString()} para ${mesesObj} meses. Te faltan $${Math.round(faltante).toLocaleString()}: con $${Math.round(aporteEfectivo).toLocaleString()}/mes lo armás en ${mesesParaCompletarlo} meses.`
    : `Fondo completo: $${Math.round(fondoActual).toLocaleString()} cubre ${mesesCubiertos.toFixed(1)} meses (meta ${mesesObj}).`;

  const yaAhorrado = Math.min(fondoActual, fondoIdeal);
  const pctCubierto = fondoIdeal > 0 ? Math.round((yaAhorrado / fondoIdeal) * 100) : 0;

  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (faltante <= 0) {
    insightTone = 'good';
    insightText = `Tu fondo ya cubre **${mesesCubiertos.toFixed(1)} meses** de gastos, completando la meta de ${mesesObj}. Pasá el excedente a instrumentos que rindan e invertí: el colchón ya está armado.`;
  } else if (mesesCubiertos < 3) {
    insightTone = 'warn';
    insightText = `Cubrís solo **${mesesCubiertos.toFixed(1)} meses** (${pctCubierto}% de la meta de ${mesesObj}): zona frágil ante un imprevisto. Apuntá primero a 3 meses sumando $${Math.round(aporteEfectivo).toLocaleString()}/mes.`;
  } else {
    insightTone = 'neutral';
    insightText = `Llevás **${pctCubierto}%** del fondo (${mesesCubiertos.toFixed(1)} de ${mesesObj} meses). Te faltan $${Math.round(faltante).toLocaleString()}: con $${Math.round(aporteEfectivo).toLocaleString()}/mes lo completás en ${mesesParaCompletarlo} meses.`;
  }

  const insight = {
    title: 'Qué dice tu colchón',
    text: insightText,
    tone: insightTone,
    icon: '\u{1F6E1}\u{FE0F}',
  };

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Ya ahorrado', value: Math.round(yaAhorrado) },
      { label: 'Faltante', value: Math.round(faltante) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(fondoIdeal).toLocaleString('es-AR'),
    centerLabel: 'Fondo objetivo',
    ariaLabel: 'Progreso del fondo de emergencia: monto ya ahorrado vs faltante para llegar al objetivo',
  };

  return {
    fondoIdeal: Math.round(fondoIdeal),
    fondoObjetivo: Math.round(fondoIdeal),
    _chart: chart,
    _insight: insight,
    mesesCubiertos: Number(mesesCubiertos.toFixed(1)),
    faltante: Math.round(faltante),
    faltaAhorrar: Math.round(faltante),
    ahorroMensualSugerido: Math.round(ahorroSugerido),
    mesesParaCompletarlo,
    mesesHastaMeta: mesesParaCompletarlo,
    cobertura,
    recomendacion,
    formula,
    explicacion,
    resumen,
  };
}
