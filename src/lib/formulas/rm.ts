/** 1RM — peso máximo levantable (Epley, Brzycki, Lombardi) */
export interface Inputs { peso: number; repeticiones: number; }
export interface Outputs {
  rmEpley: number;
  rmBrzycki: number;
  rmLombardi: number;
  promedio: number;
  porcentajes: Array<{ pct: number; peso: number; reps: number }>;
}

export function rm(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const reps = Number(i.repeticiones);
  if (!peso || peso <= 0) throw new Error('Ingresá el peso levantado');
  if (!reps || reps <= 0 || reps > 15) throw new Error('Las repeticiones deben estar entre 1 y 15 para buena precisión');

  // Epley: 1RM = peso × (1 + reps / 30)
  const epley = peso * (1 + reps / 30);
  // Brzycki: 1RM = peso × 36 / (37 − reps)
  const brzycki = peso * 36 / (37 - reps);
  // Lombardi: 1RM = peso × reps^0.10
  const lombardi = peso * Math.pow(reps, 0.10);

  const promedio = (epley + brzycki + lombardi) / 3;

  const porcentajes = [
    { pct: 95, reps: 2 },
    { pct: 90, reps: 4 },
    { pct: 85, reps: 6 },
    { pct: 80, reps: 8 },
    { pct: 75, reps: 10 },
    { pct: 70, reps: 12 },
    { pct: 65, reps: 15 },
  ].map(r => ({ pct: r.pct, peso: Math.round(promedio * r.pct / 100), reps: r.reps }));

  return {
    rmEpley: Math.round(epley * 10) / 10,
    rmBrzycki: Math.round(brzycki * 10) / 10,
    rmLombardi: Math.round(lombardi * 10) / 10,
    promedio: Math.round(promedio * 10) / 10,
    porcentajes,
  };
}
