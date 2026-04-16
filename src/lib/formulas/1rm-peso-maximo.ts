/** Calculadora de 1RM — Peso máximo en una repetición */
export interface Inputs {
  peso: number;
  repeticiones: number;
}
export interface Outputs {
  rm1: number;
  rm3: number;
  rm5: number;
  rm8: number;
  rm10: number;
  rm12: number;
  mensaje: string;
}

export function rmPesoMaximo(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const reps = Number(i.repeticiones);
  if (!peso || peso <= 0) throw new Error('Ingresá el peso levantado');
  if (!reps || reps < 1 || reps > 30) throw new Error('Ingresá entre 1 y 30 repeticiones');

  // Fórmula Epley: 1RM = peso × (1 + reps / 30)
  const rm1 = reps === 1 ? peso : peso * (1 + reps / 30);

  // Porcentajes aproximados para distintos RM
  const rm3 = rm1 * 0.93;
  const rm5 = rm1 * 0.87;
  const rm8 = rm1 * 0.80;
  const rm10 = rm1 * 0.75;
  const rm12 = rm1 * 0.70;

  return {
    rm1: Number(rm1.toFixed(1)),
    rm3: Number(rm3.toFixed(1)),
    rm5: Number(rm5.toFixed(1)),
    rm8: Number(rm8.toFixed(1)),
    rm10: Number(rm10.toFixed(1)),
    rm12: Number(rm12.toFixed(1)),
    mensaje: `Tu 1RM estimado es ${rm1.toFixed(1)} kg. Para hipertrofia trabajá con ${rm8.toFixed(1)}–${rm12.toFixed(1)} kg (8–12 reps).`,
  };
}
