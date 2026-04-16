/** 1RM multi-fórmula: Epley, Brzycki, Lander, Lombardi */
export interface Inputs {
  peso: number;
  repeticiones: number;
}
export interface Outputs {
  promedio: number;
  epley: number;
  brzycki: number;
  lander: number;
  lombardi: number;
  mensaje: string;
}

export function repeticionMaximaEstimada(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const reps = Number(i.repeticiones);
  if (!peso || peso <= 0) throw new Error('Ingresá el peso');
  if (!reps || reps < 2 || reps > 20) throw new Error('Ingresá entre 2 y 20 repeticiones');

  const epley = peso * (1 + reps / 30);
  const brzycki = peso * (36 / (37 - reps));
  const lander = (100 * peso) / (101.3 - 2.67123 * reps);
  const lombardi = peso * Math.pow(reps, 0.10);
  const promedio = (epley + brzycki + lander + lombardi) / 4;

  const diff = Math.abs(Math.max(epley, brzycki, lander, lombardi) - Math.min(epley, brzycki, lander, lombardi));

  return {
    promedio: Number(promedio.toFixed(1)),
    epley: Number(epley.toFixed(1)),
    brzycki: Number(brzycki.toFixed(1)),
    lander: Number(lander.toFixed(1)),
    lombardi: Number(lombardi.toFixed(1)),
    mensaje: `1RM promedio: ${promedio.toFixed(1)} kg (dispersión entre fórmulas: ${diff.toFixed(1)} kg). Usá el promedio como referencia.`
  };
}