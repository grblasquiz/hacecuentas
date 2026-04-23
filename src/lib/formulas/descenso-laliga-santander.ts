/**
 * Descenso LaLiga (España). 20 equipos, 3 descienden (18º-19º-20º).
 * Temporada regular 38 fechas.
 *
 * Input: puntos del equipo, puntos del 17º (último salvado),
 * fechas restantes.
 * Output: puntos para alcanzar al 17º, safety threshold histórico (~38 pts),
 * veredicto.
 */

export interface DescensoLaLigaInputs {
  puntosEquipo: number;
  puntosDecimoSeptimo: number;
  fechasRestantes: number;
  safetyThreshold?: number; // default 38
}

export interface DescensoLaLigaOutputs {
  puntosParaAlcanzar17: number;
  puntosMaxPosibles: number;
  puntosProyectadosEmpatando: number;
  diferenciaConSafety: number;
  porcentajeSalvacion: number;
  veredicto: string;
}

export function descensoLaligaSantander(inputs: DescensoLaLigaInputs): DescensoLaLigaOutputs {
  const pts = Number(inputs.puntosEquipo) || 0;
  const pts17 = Number(inputs.puntosDecimoSeptimo) || 0;
  const fechas = Math.max(0, Number(inputs.fechasRestantes) || 0);
  const safety = Number(inputs.safetyThreshold) || 38;

  const puntosParaAlcanzar17 = Math.max(0, pts17 - pts + 1); // +1 para superarlo
  const puntosMaxPosibles = pts + fechas * 3;
  const puntosProyectadosEmpatando = pts + fechas * 1;
  const diferenciaConSafety = pts - safety;

  // Probabilidad simple de salvación heurística:
  // si ya está por encima del umbral → 95%
  // si le faltan pocos puntos vs restantes → escala lineal
  let porcentajeSalvacion: number;
  if (puntosMaxPosibles < safety) {
    porcentajeSalvacion = 0;
  } else if (pts >= safety) {
    porcentajeSalvacion = 95;
  } else {
    const gap = safety - pts;
    const maxGanables = Math.max(1, fechas * 3);
    porcentajeSalvacion = Math.max(5, Math.min(90, 100 - (gap / maxGanables) * 100));
  }

  let veredicto = '';
  if (puntosMaxPosibles < pts17) {
    veredicto = '🔴 Matemáticamente descendido: imposible alcanzar al 17º.';
  } else if (pts >= safety && pts > pts17) {
    veredicto = '✅ Salvación virtual: por encima del umbral histórico.';
  } else if (puntosParaAlcanzar17 > fechas * 3 * 0.6) {
    veredicto = '⚠️ Crítico: necesitás ganar la mayoría de los partidos que quedan.';
  } else if (puntosParaAlcanzar17 > fechas) {
    veredicto = '🟠 Complicado pero posible: varios triunfos directos.';
  } else {
    veredicto = '🟡 En tus manos: con 2-3 triunfos te salvás.';
  }

  return {
    puntosParaAlcanzar17,
    puntosMaxPosibles,
    puntosProyectadosEmpatando,
    diferenciaConSafety,
    porcentajeSalvacion: Number(porcentajeSalvacion.toFixed(1)),
    veredicto,
  };
}
