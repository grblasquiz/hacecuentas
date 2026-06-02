/** Mundial 2026: estimador de Bota/Botín de Oro (goleador del torneo). */
export interface Inputs {
  nombreJugador: string;
  goles90Club: number;
  minutosEsperados: string; // '270' | '360' | '540' | '720' | '900' | '1080'
  factorTorneo: string; // '1.1' | '1.0' | '0.9' | '0.8'
}

export interface Outputs {
  golesEsperados: number;
  probMas6Goles: number;
  probMas8Goles: number;
  rankingCandidatos: string;
  interpretacion: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

/** Aproximación Poisson acumulada: P(X > k) cuando λ = lambda. */
function poissonProbGreater(lambda: number, k: number): number {
  // P(X > k) = 1 - P(X <= k) = 1 - sum_{i=0..k} e^-lambda * lambda^i / i!
  let acc = 0;
  let term = Math.exp(-lambda);
  acc += term;
  for (let i = 1; i <= k; i++) {
    term = term * lambda / i;
    acc += term;
  }
  return Math.max(0, Math.min(1, 1 - acc));
}

export function mundial2026BotinOroGoleadorEstimador(i: Inputs): Outputs {
  const nombre = String(i.nombreJugador || 'Jugador').trim() || 'Jugador';
  const g90 = Number(i.goles90Club || 0);
  const minStr = String(i.minutosEsperados || '720');
  const factorStr = String(i.factorTorneo || '1.0');

  if (!isFinite(g90) || g90 < 0 || g90 > 2) throw new Error('G/90 fuera de rango (0-2).');

  const minutos = Number(minStr);
  if (!isFinite(minutos) || minutos < 90) throw new Error('Minutos esperados inválidos.');

  const factor = Number(factorStr);
  if (!isFinite(factor) || factor < 0.5 || factor > 1.5) throw new Error('Factor torneo inválido.');

  // xG en Mundial: G/90 × (minutos / 90) × factor.
  const xg = g90 * (minutos / 90) * factor;

  // Probabilidades vía Poisson.
  const probMas6 = poissonProbGreater(xg, 6);
  const probMas8 = poissonProbGreater(xg, 8);

  // Ranking entre top 10 candidatos.
  // Distribución típica top 10 candidatos: xG de ~3 (último) a ~10 (Mbappé óptimo).
  let ranking: string;
  if (xg >= 9) ranking = '#1-2 — Máximo favorito al Bota de Oro';
  else if (xg >= 7) ranking = '#3-5 — Top candidato real';
  else if (xg >= 5) ranking = '#6-10 — Candidato con chance';
  else if (xg >= 3) ranking = '+10 — Outsider, necesita golpe de suerte';
  else ranking = 'Fuera del top 15 — chance mínima';

  // Interpretación.
  let interpretacion: string;
  if (xg >= 8 && probMas6 >= 0.7) {
    interpretacion = `**Candidato fuerte al Bota de Oro.** xG ${xg.toFixed(2)} supera la mediana histórica (6 goles). Si mantiene G/90 y juega los minutos esperados, queda en el top 1-3 del torneo.`;
  } else if (xg >= 6) {
    interpretacion = `**Candidato con buena chance.** xG ${xg.toFixed(2)} en línea con el umbral histórico de 6 goles. Necesita un poco de suerte (factor torneo o minutos extra por prórrogas).`;
  } else if (xg >= 4) {
    interpretacion = `**Outsider.** xG ${xg.toFixed(2)} por debajo del umbral típico. Para ganar Bota necesita milagro: factor torneo +20% + minutos a final + G/90 sobre rendimiento.`;
  } else {
    interpretacion = `**Sin chance realista.** xG ${xg.toFixed(2)} muy por debajo del umbral histórico (6 goles). El equipo cae temprano o el G/90 es bajo.`;
  }

  const resumen = `${nombre} con G/90 = ${g90.toFixed(2)}, ${minutos} min esperados, factor ${factor.toFixed(2)}: xG en Mundial = **${xg.toFixed(2)} goles**. Probabilidad de superar 6 goles: ${(probMas6 * 100).toFixed(1)}%. Superar 8 goles: ${(probMas8 * 100).toFixed(1)}%. ${ranking}.`;

  const insightTone = xg >= 7 ? 'good' : xg >= 4 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Lectura del xG',
    text: `Con un xG de **${xg.toFixed(2)} goles**, ${nombre} tiene **${(probMas6 * 100).toFixed(0)}%** de chance de pasar los 6 goles (la mediana histórica del Botín de Oro). Su ubicación: ${ranking.toLowerCase()}.`,
    tone: insightTone,
    icon: '👟',
  };

  // Gauge sobre el xG, con las mismas zonas que el ranking.
  const lastMax = Math.max(11, Math.ceil(xg) + 1);
  const _chart = {
    type: 'scale',
    marker: Number(xg.toFixed(2)),
    markerLabel: `xG ${xg.toFixed(2)}`,
    min: 0,
    segments: [
      { nombre: 'Sin chance', max: 3, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Outsider', max: 5, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Con chance', max: 7, color: '#eab308', colorDark: '#a16207' },
      { nombre: 'Top candidato', max: 9, color: '#84cc16', colorDark: '#4d7c0f' },
      { nombre: 'Máximo favorito', max: lastMax, color: '#22c55e', colorDark: '#15803d' },
    ],
    ariaLabel: `Escala de candidatura al Botín de Oro: un xG de ${xg.toFixed(2)} ubica al jugador en la zona "${ranking}".`,
  };

  return {
    golesEsperados: Number(xg.toFixed(2)),
    probMas6Goles: Number((probMas6 * 100).toFixed(2)),
    probMas8Goles: Number((probMas8 * 100).toFixed(2)),
    rankingCandidatos: ranking,
    interpretacion,
    resumen,
    _insight,
    _chart,
  };
}
