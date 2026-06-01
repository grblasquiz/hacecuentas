/** Mundial 2026: probabilidad de ganar una quiniela / pool entre amigos. */
export interface Inputs {
  participantes: number;
  partidos: number;
  skill: string; // 'random' | 'casual' | 'fan' | 'experto'
  aciertosPrevios?: number;
  apuesta?: number;
}

export interface Outputs {
  probabilidadGanar: string;
  aciertosEsperados: string;
  rankingEstimado: string;
  expectedValue: string;
  recomendacion: string;
  resumen: string;
}

const SKILL_RATE: Record<string, number> = {
  random: 0.33,
  casual: 0.40,
  fan: 0.50,
  experto: 0.55,
};

const SKILL_LABEL: Record<string, string> = {
  random: 'Al azar',
  casual: 'Casual',
  fan: 'Fanático',
  experto: 'Experto',
};

export function mundial2026QuinielaPoolProbabilidad(i: Inputs): Outputs {
  const N = Math.max(5, Math.min(100, Math.floor(Number(i.participantes || 0))));
  const P = Math.max(10, Math.min(104, Math.floor(Number(i.partidos || 0))));
  const skillKey = String(i.skill || 'fan').toLowerCase();
  const apuesta = Math.max(0, Number(i.apuesta || 0));

  if (!SKILL_RATE[skillKey]) throw new Error('Skill inválido.');
  if (N < 5) throw new Error('Mínimo 5 participantes.');
  if (P < 10) throw new Error('Mínimo 10 partidos.');

  // Si el usuario aportó aciertos previos, los promediamos con el skill teórico.
  const prevAciertos = Number(i.aciertosPrevios || 0);
  let myRate = SKILL_RATE[skillKey];
  if (prevAciertos > 0 && prevAciertos <= 100) {
    myRate = (myRate + prevAciertos / 100) / 2;
  }

  // Asumimos que el pool promedio está entre casual y fan (45%).
  const poolAvgRate = 0.45;

  // Aciertos esperados.
  const aciertosEsp = P * myRate;
  const aciertosPoolAvg = P * poolAvgRate;

  // Probabilidad de quedar primero.
  // Modelo simplificado: ventaja relativa de skill, amplificada por sqrt(partidos).
  // Si skill_ratio = 1 → proba = 1/N (todos iguales).
  // Si skill_ratio > 1 → proba > 1/N. Se satura cerca de 0.6-0.7 para skills extremos.
  const skillRatio = myRate / poolAvgRate;
  const exp = Math.sqrt(P) / 8; // factor de amplificación moderado
  const raw = Math.pow(skillRatio, exp) / N;
  const probaGanar = Math.max(0.001, Math.min(0.7, raw));

  // Ranking estimado: media + ajuste por skill.
  const rankingMedio = (N + 1) / 2;
  const ajusteSkill = (myRate - poolAvgRate) * P * 0.15;
  const rankingEst = Math.max(1, Math.min(N, Math.round(rankingMedio - ajusteSkill)));

  // Expected value (asume winner takes all).
  const bote = apuesta * N;
  const ev = probaGanar * bote - apuesta;

  // Recomendación.
  let reco = '';
  if (probaGanar > 0.15 && ev > 0) {
    reco = 'ENTRÁ — tenés ventaja real y EV positivo. Aprovechá.';
  } else if (probaGanar > 0.05 && ev > -apuesta * 0.3) {
    reco = 'OK — chance razonable. Vale la pena por el entretenimiento aunque EV sea modesto.';
  } else if (ev < -apuesta * 0.5) {
    reco = 'PENSALO — pool muy grande o skill bajo. EV claramente negativo. Entrá solo por diversión, no por ganar.';
  } else {
    reco = 'NEUTRO — chance baja pero costo razonable. Decisión personal.';
  }

  // Mensaje sobre varianza por partidos.
  let varianzaMsg = '';
  if (P < 30) {
    varianzaMsg = ' Con pocos partidos, la suerte manda — un random puede ganarte.';
  } else if (P >= 80) {
    varianzaMsg = ' Con 80+ partidos, el skill domina; si tenés ventaja real, se va a notar.';
  }

  const probaPct = (probaGanar * 100).toFixed(1);
  const evTxt = apuesta > 0
    ? `**EV = ${ev >= 0 ? '+' : ''}USD ${ev.toFixed(2)}** sobre apuesta de USD ${apuesta.toFixed(0)} (bote total USD ${bote.toFixed(0)}).`
    : 'Ingresá una apuesta para calcular Expected Value en USD.';

  return {
    probabilidadGanar: `${probaPct}%`,
    aciertosEsperados: `**${aciertosEsp.toFixed(1)} aciertos** esperados de ${P} partidos (${(myRate * 100).toFixed(0)}% acierto). El pool promedio acertaría ${aciertosPoolAvg.toFixed(1)}.`,
    rankingEstimado: `Ranking estimado: **puesto ${rankingEst}** de ${N}.${rankingEst === 1 ? ' Sos el favorito matemático del pool.' : ''}`,
    expectedValue: evTxt,
    recomendacion: reco,
    resumen: `Como ${SKILL_LABEL[skillKey]} en pool de ${N} con ${P} partidos: ${probaPct}% chance de ganar, ${aciertosEsp.toFixed(0)} aciertos esperados, ranking ~${rankingEst}.${varianzaMsg} ${reco}`,
  };
}
