/**
 * Descenso Brasileirão Série A. 20 equipos, 4 descienden (17º-20º).
 * Temporada regular 38 fechas.
 */

export interface DescensoBrasileiraoInputs {
  puntosEquipo: number;
  puntosDecimoSexto: number; // 16º (último salvado)
  fechasRestantes: number;
  safetyThreshold?: number; // default 45
}

export interface DescensoBrasileiraoOutputs {
  puntosParaAlcanzar16: number;
  puntosMaxPosibles: number;
  puntosEsperadosFinal: number;
  diferenciaConSafety: number;
  veredicto: string;
}

export function descensoBrasileirao(inputs: DescensoBrasileiraoInputs): DescensoBrasileiraoOutputs {
  const pts = Number(inputs.puntosEquipo) || 0;
  const pts16 = Number(inputs.puntosDecimoSexto) || 0;
  const fechas = Math.max(0, Number(inputs.fechasRestantes) || 0);
  const safety = Number(inputs.safetyThreshold) || 45;

  const fechasJugadas = Math.max(1, 38 - fechas);
  const proyeccion = pts / fechasJugadas;
  const puntosEsperadosFinal = Math.round(proyeccion * 38);

  const puntosParaAlcanzar16 = Math.max(0, pts16 - pts + 1);
  const puntosMaxPosibles = pts + fechas * 3;
  const diferenciaConSafety = pts - safety;

  let veredicto = '';
  if (puntosMaxPosibles < pts16) {
    veredicto = '🔴 Rebaixado matematicamente: imposible alcanzar al 16º.';
  } else if (pts >= safety && pts > pts16) {
    veredicto = '✅ Salvación: cruzaste los 45 puntos, umbral histórico.';
  } else if (puntosEsperadosFinal >= safety) {
    veredicto = '🟢 Ritmo seguro: al paso actual te salvás.';
  } else if (puntosParaAlcanzar16 > fechas * 3 * 0.6) {
    veredicto = '⚠️ Crítico: necesitás ganar casi todo.';
  } else if (puntosParaAlcanzar16 > fechas) {
    veredicto = '🟠 Complicado: varios triunfos seguidos.';
  } else {
    veredicto = '🟡 Depende de vos: 2-3 triunfos alcanzan.';
  }

  return {
    puntosParaAlcanzar16,
    puntosMaxPosibles,
    puntosEsperadosFinal,
    diferenciaConSafety,
    veredicto,
  };
}
