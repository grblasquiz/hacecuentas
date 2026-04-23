/**
 * Tabla Anual Argentina — suma Apertura + Clausura por año.
 *
 * El Torneo Apertura y Clausura tienen 27 fechas cada uno. La tabla anual
 * combinada se usa para definir clasificación a Copa Libertadores y Sudamericana,
 * y también para el descenso (junto a la tabla de promedios).
 */

export interface TablaAnualInputs {
  puntosApertura: number;
  partidosApertura: number;
  puntosClausura: number;
  partidosClausura: number;
  fechasClausuraRestantes: number;
}

export interface TablaAnualOutputs {
  puntosTotalesAnual: number;
  partidosTotalesAnual: number;
  promedioPorPartido: number;
  puntosEsperadosFinal: number; // al ritmo actual, al terminar
  puntosMaxPosibles: number;
  clasificacionEstimada: string;
}

export function tablaAnualArgentina(inputs: TablaAnualInputs): TablaAnualOutputs {
  const pA = Number(inputs.puntosApertura) || 0;
  const jA = Number(inputs.partidosApertura) || 0;
  const pC = Number(inputs.puntosClausura) || 0;
  const jC = Number(inputs.partidosClausura) || 0;
  const rest = Math.max(0, Number(inputs.fechasClausuraRestantes) || 0);

  const puntosTotalesAnual = pA + pC;
  const partidosTotalesAnual = jA + jC;
  if (partidosTotalesAnual === 0) {
    throw new Error('Ingresá partidos jugados en Apertura y/o Clausura.');
  }

  const promedioPorPartido = puntosTotalesAnual / partidosTotalesAnual;
  const partidosFinales = partidosTotalesAnual + rest;
  const puntosEsperadosFinal = Math.round(promedioPorPartido * partidosFinales);
  const puntosMaxPosibles = puntosTotalesAnual + rest * 3;

  // Tabla anual AR 2026 (orientativa, basada en 54 fechas totales):
  //  ~75+ pts: campeón anual
  //  ~65-74: Libertadores (top 6)
  //  ~55-64: Sudamericana
  //  ~45-54: mitad de tabla
  //  <45: zona baja
  let clasificacionEstimada = '';
  if (puntosEsperadosFinal >= 75) {
    clasificacionEstimada = '🏆 Zona campeonato anual / Copa Libertadores directa';
  } else if (puntosEsperadosFinal >= 65) {
    clasificacionEstimada = '🥇 Copa Libertadores (top 6 anual)';
  } else if (puntosEsperadosFinal >= 55) {
    clasificacionEstimada = '🥈 Copa Sudamericana';
  } else if (puntosEsperadosFinal >= 45) {
    clasificacionEstimada = '🟢 Mitad de tabla, tranquilo';
  } else if (puntosEsperadosFinal >= 35) {
    clasificacionEstimada = '🟡 Zona baja — mirar tabla anual de descenso';
  } else {
    clasificacionEstimada = '🔴 Peligro: zona de descenso por tabla anual';
  }

  return {
    puntosTotalesAnual,
    partidosTotalesAnual,
    promedioPorPartido: Number(promedioPorPartido.toFixed(3)),
    puntosEsperadosFinal,
    puntosMaxPosibles,
    clasificacionEstimada,
  };
}
