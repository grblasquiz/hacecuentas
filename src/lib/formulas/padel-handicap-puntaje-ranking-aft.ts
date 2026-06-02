/** Puntos AFT que sumás según ranking rival y resultado */
export interface Inputs { rankingPropio: number; rankingRival: number; resultado: 'ganaste' | 'perdiste'; rondaTorneo: 'octavos' | 'cuartos' | 'semis' | 'final' | 'amistoso'; }
export interface Outputs { puntosBase: number; multiplicadorRival: number; puntosTotales: number; explicacion: string; _insight?: any; }
export function padelHandicapPuntajeRankingAft(i: Inputs): Outputs {
  const rPropio = Number(i.rankingPropio);
  const rRival = Number(i.rankingRival);
  if (!rPropio || rPropio <= 0) throw new Error('Ingresá ranking propio AFT');
  if (!rRival || rRival <= 0) throw new Error('Ingresá ranking rival AFT');
  // Sistema simplificado AFT: puntos por ronda + ajuste por diferencia ranking
  const puntosBase: Record<string, number> = {
    octavos: 50,
    cuartos: 100,
    semis: 200,
    final: 400,
    amistoso: 25,
  };
  const base = puntosBase[i.rondaTorneo] || 50;
  // Diferencia: si ganás a alguien mejor (ranking más bajo número), bonus
  const dif = rRival - rPropio;
  let mult = 1;
  if (i.resultado === 'ganaste') {
    if (dif < -100) mult = 2; // rival mucho mejor
    else if (dif < 0) mult = 1.5;
    else if (dif > 200) mult = 0.5; // rival muy inferior
    else mult = 1;
  } else {
    if (dif > 100) mult = 0.3; // perdiste con peor: igual algo sumás
    else mult = 0.1;
  }
  const total = Math.round(base * mult);
  const gano = i.resultado === 'ganaste';
  let insTone: string, insText: string;
  if (gano && mult > 1) {
    insTone = 'good';
    insText = `Le ganaste a un rival **mejor o igual rankeado** (ranking ${rRival} vs tu ${rPropio}), así que el sistema premia la hazaña con un multiplicador de **${mult.toFixed(2)}x**: en vez de ${base} pts base, te llevás **${total} pts AFT**. Vencer a alguien por encima tuyo es la forma más rápida de escalar el ranking.`;
  } else if (gano) {
    insTone = 'neutral';
    insText = `Ganaste, pero contra un rival **bastante peor rankeado** (ranking ${rRival} vs tu ${rPropio}), por eso el multiplicador es solo **${mult.toFixed(2)}x** y sumás **${total} pts** sobre los ${base} de base. Era el resultado esperado: ganar acá suma poco, perder restaría imagen.`;
  } else {
    insTone = 'warn';
    insText = `Perdiste, así que rescatás apenas **${total} pts** (multiplicador **${mult.toFixed(2)}x** sobre ${base} de base). El sistema AFT da algo más de consuelo si caés ante alguien mejor rankeado, pero la derrota frena tu progreso: el camino es sumar ganándole a rivales de tu nivel o superiores.`;
  }
  const insight = {
    title: 'Qué dice tu multiplicador',
    text: insText,
    tone: insTone,
    icon: gano ? '🏆' : '🎾',
  };
  return {
    puntosBase: base,
    multiplicadorRival: Number(mult.toFixed(2)),
    puntosTotales: total,
    explicacion: `${i.resultado === 'ganaste' ? 'Ganaste' : 'Perdiste'} en ${i.rondaTorneo} (base ${base} pts) contra rival ranking ${rRival} (multiplicador ${mult.toFixed(2)}x). Sumás ${total} puntos AFT estimados.`,
    _insight: insight,
  };
}
