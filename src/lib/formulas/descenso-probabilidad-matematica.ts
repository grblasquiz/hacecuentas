/**
 * Probabilidad matemática de descenso en fecha X.
 *
 * Input: puntos equipo, puntos del 18º (o último salvado), fechas restantes.
 * Calcula:
 *   - Puntos máximos posibles del equipo.
 *   - Puntos máximos posibles del 18º.
 *   - Si max_equipo < pts_18º_actuales → descendido matemáticamente.
 *   - Probabilidad de salvación heurística basada en gap relativo.
 */

export interface ProbDescensoInputs {
  puntosEquipo: number;
  puntosDecimoOctavo: number; // último salvado
  fechasRestantes: number;
}

export interface ProbDescensoOutputs {
  puntosMaxEquipo: number;
  puntosMaxRival: number;
  diferenciaActual: number;
  probabilidadSalvacion: number;
  descendidoMatematico: boolean;
  veredicto: string;
}

export function descensoProbabilidadMatematica(
  inputs: ProbDescensoInputs
): ProbDescensoOutputs {
  const pts = Number(inputs.puntosEquipo) || 0;
  const pts18 = Number(inputs.puntosDecimoOctavo) || 0;
  const fechas = Math.max(0, Number(inputs.fechasRestantes) || 0);

  const puntosMaxEquipo = pts + fechas * 3;
  const puntosMaxRival = pts18 + fechas * 3;
  const diferenciaActual = pts - pts18;

  const descendidoMatematico = puntosMaxEquipo < pts18;

  let probabilidadSalvacion: number;
  if (descendidoMatematico) {
    probabilidadSalvacion = 0;
  } else if (pts > pts18 && fechas === 0) {
    probabilidadSalvacion = 100;
  } else if (pts > pts18) {
    // Ya arriba: probabilidad alta, baja si quedan muchas fechas
    const colchon = pts - pts18;
    const maxPerdible = fechas * 3;
    probabilidadSalvacion = Math.min(98, 70 + (colchon / Math.max(1, maxPerdible)) * 28);
  } else {
    // Debajo o igualado: probabilidad baja
    const gap = pts18 - pts;
    const maxGanables = Math.max(1, fechas * 3);
    probabilidadSalvacion = Math.max(2, 50 - (gap / maxGanables) * 50);
  }

  probabilidadSalvacion = Number(probabilidadSalvacion.toFixed(1));

  let veredicto = '';
  if (descendidoMatematico) {
    veredicto = '🔴 Descenso matemático confirmado: no alcanzan los puntos posibles.';
  } else if (probabilidadSalvacion >= 85) {
    veredicto = '✅ Salvación altamente probable.';
  } else if (probabilidadSalvacion >= 55) {
    veredicto = '🟢 Favorito a salvarse.';
  } else if (probabilidadSalvacion >= 30) {
    veredicto = '🟡 50/50 — cada partido cuenta doble.';
  } else if (probabilidadSalvacion >= 10) {
    veredicto = '🟠 Complicado: necesitás una racha ganadora.';
  } else {
    veredicto = '⚠️ Casi perdido: solo un milagro estadístico.';
  }

  return {
    puntosMaxEquipo,
    puntosMaxRival,
    diferenciaActual,
    probabilidadSalvacion,
    descendidoMatematico,
    veredicto,
  };
}
