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
  _insight?: any;
  _chart?: any;
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

  const posTxt = diferenciaActual > 0
    ? `le sacás **${diferenciaActual}** ${diferenciaActual === 1 ? 'punto' : 'puntos'} al último salvado`
    : diferenciaActual === 0
      ? `estás **igualado** en puntos con el último salvado`
      : `estás **${Math.abs(diferenciaActual)}** ${Math.abs(diferenciaActual) === 1 ? 'punto' : 'puntos'} por debajo del último salvado`;
  const _insight = {
    title: descendidoMatematico ? 'Descenso matemático' : 'Tu probabilidad de zafar',
    text: descendidoMatematico
      ? `Tu techo es **${puntosMaxEquipo} pts** y el rival ya tiene **${pts18}**: ni ganando las **${fechas}** ${fechas === 1 ? 'fecha' : 'fechas'} restantes lo alcanzás. Descenso confirmado.`
      : `Con **${fechas}** ${fechas === 1 ? 'fecha' : 'fechas'} por jugar ${posTxt}, la probabilidad estimada de salvación es **${probabilidadSalvacion}%**. ${probabilidadSalvacion >= 55 ? 'La inercia te favorece, pero no aflojes.' : probabilidadSalvacion >= 30 ? 'Es una moneda al aire: cada partido pesa el doble.' : 'Necesitás una racha y que los rivales pinchen.'}`,
    tone: probabilidadSalvacion >= 55 ? 'good' : probabilidadSalvacion >= 30 ? 'neutral' : 'warn',
    icon: '⚽',
  };
  const _chart = {
    type: 'scale',
    marker: probabilidadSalvacion,
    markerLabel: `${probabilidadSalvacion}%`,
    min: 0,
    segments: [
      { nombre: 'Casi perdido', max: 10, color: '#ef4444', colorDark: '#f87171' },
      { nombre: 'Complicado', max: 30, color: '#f97316', colorDark: '#fb923c' },
      { nombre: '50/50', max: 55, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Favorito', max: 85, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Casi salvado', max: 100, color: '#22c55e', colorDark: '#4ade80' },
    ],
    ariaLabel: `Probabilidad de salvación: ${probabilidadSalvacion}%`,
  };

  return {
    puntosMaxEquipo,
    puntosMaxRival,
    diferenciaActual,
    probabilidadSalvacion,
    descendidoMatematico,
    veredicto,
    _insight,
    _chart,
  };
}
