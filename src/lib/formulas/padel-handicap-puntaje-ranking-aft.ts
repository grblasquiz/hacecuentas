/** Puntos AFT que sumás según ranking rival y resultado */
export interface Inputs { rankingPropio: number; rankingRival: number; resultado: 'ganaste' | 'perdiste'; rondaTorneo: 'octavos' | 'cuartos' | 'semis' | 'final' | 'amistoso'; }
export interface Outputs { puntosBase: number; multiplicadorRival: number; puntosTotales: number; explicacion: string; }
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
  return {
    puntosBase: base,
    multiplicadorRival: Number(mult.toFixed(2)),
    puntosTotales: total,
    explicacion: `${i.resultado === 'ganaste' ? 'Ganaste' : 'Perdiste'} en ${i.rondaTorneo} (base ${base} pts) contra rival ranking ${rRival} (multiplicador ${mult.toFixed(2)}x). Sumás ${total} puntos AFT estimados.`,
  };
}
