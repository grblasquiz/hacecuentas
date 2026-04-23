/**
 * Descenso Premier League (Inglaterra). 20 equipos, 3 descienden (18º-19º-20º).
 * Temporada regular 38 fechas.
 *
 * Umbral de salvación histórico: 35-40 puntos. Promedio "40-point mark".
 */

export interface DescensoPremierInputs {
  puntosEquipo: number;
  puntosDecimoSeptimo: number;
  fechasRestantes: number;
  safetyThreshold?: number; // default 40
}

export interface DescensoPremierOutputs {
  puntosParaAlcanzar17: number;
  puntosMaxPosibles: number;
  proyeccionActualPorPartido: number;
  puntosEsperadosFinal: number;
  diferenciaConSafety: number;
  veredicto: string;
}

export function descensoPremierLeague(inputs: DescensoPremierInputs): DescensoPremierOutputs {
  const pts = Number(inputs.puntosEquipo) || 0;
  const pts17 = Number(inputs.puntosDecimoSeptimo) || 0;
  const fechas = Math.max(0, Number(inputs.fechasRestantes) || 0);
  const safety = Number(inputs.safetyThreshold) || 40;

  const fechasJugadas = Math.max(1, 38 - fechas);
  const proyeccionActualPorPartido = pts / fechasJugadas;
  const puntosEsperadosFinal = Math.round(proyeccionActualPorPartido * 38);

  const puntosParaAlcanzar17 = Math.max(0, pts17 - pts + 1);
  const puntosMaxPosibles = pts + fechas * 3;
  const diferenciaConSafety = pts - safety;

  let veredicto = '';
  if (puntosMaxPosibles < pts17) {
    veredicto = '🔴 Descendido matemáticamente: imposible superar al 17º.';
  } else if (pts >= safety && pts > pts17) {
    veredicto = '✅ Safe: cruzaste el umbral de los 40 puntos.';
  } else if (puntosEsperadosFinal >= safety) {
    veredicto = '🟢 Ritmo seguro: al paso actual terminás salvado.';
  } else if (puntosParaAlcanzar17 > fechas * 3 * 0.6) {
    veredicto = '⚠️ Very tight: need a winning streak.';
  } else if (puntosParaAlcanzar17 > fechas) {
    veredicto = '🟠 Complicado: varios triunfos en run-in.';
  } else {
    veredicto = '🟡 En tus manos: 2-3 triunfos alcanzan.';
  }

  return {
    puntosParaAlcanzar17,
    puntosMaxPosibles,
    proyeccionActualPorPartido: Number(proyeccionActualPorPartido.toFixed(2)),
    puntosEsperadosFinal,
    diferenciaConSafety,
    veredicto,
  };
}
