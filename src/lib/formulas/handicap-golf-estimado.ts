/** Handicap de golf estimado */
export interface Inputs {
  score1: number;
  score2: number;
  score3: number;
  courseRating: number;
  slope: number;
}
export interface Outputs {
  handicap: number;
  diferencial1: number;
  diferencial2: number;
  diferencial3: number;
  nivel: string;
  mensaje: string;
}

export function handicapGolfEstimado(i: Inputs): Outputs {
  const scores = [Number(i.score1), Number(i.score2), Number(i.score3)];
  const cr = Number(i.courseRating);
  const slope = Number(i.slope);
  if (scores.some(s => !s || s <= 0)) throw new Error('Ingresá los 3 scores');
  if (!cr || !slope) throw new Error('Ingresá Course Rating y Slope');

  // Calculate differentials: (Score - Course Rating) × 113 / Slope
  const diferenciales = scores.map(s => Number(((s - cr) * 113 / slope).toFixed(1)));

  // With 3 scores, WHS uses the best 1 differential - 2 adjustment
  const sorted = [...diferenciales].sort((a, b) => a - b);
  // Simplified: average of best 2 (with 3 rounds, use best 1 × adjustment)
  const handicap = Number((sorted[0] - 2).toFixed(1)); // WHS adjustment for 3 rounds

  let nivel: string;
  if (handicap < 0) nivel = 'Scratch o mejor (profesional)';
  else if (handicap <= 5) nivel = 'Jugador avanzado (single digit)';
  else if (handicap <= 10) nivel = 'Jugador avanzado';
  else if (handicap <= 18) nivel = 'Jugador intermedio';
  else if (handicap <= 28) nivel = 'Jugador principiante-intermedio';
  else nivel = 'Jugador principiante';

  const hcap = Math.max(0, handicap);

  return {
    handicap: hcap,
    diferencial1: diferenciales[0],
    diferencial2: diferenciales[1],
    diferencial3: diferenciales[2],
    nivel,
    mensaje: `Handicap estimado: ${hcap}. ${nivel}. Mejor diferencial: ${sorted[0]}.`
  };
}