/** Calculadora de 1RM — Peso máximo en una repetición */
export interface Inputs {
  peso: number;
  repeticiones: number;
  __lang?: string;
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
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errPeso: 'Ingresá el peso levantado',
      errReps: 'Ingresá entre 1 y 30 repeticiones',
    },
    en: {
      errPeso: 'Enter the weight lifted',
      errReps: 'Enter between 1 and 30 repetitions',
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const reps = Number(i.repeticiones);
  if (!peso || peso <= 0) throw new Error(T.errPeso);
  if (!reps || reps < 1 || reps > 30) throw new Error(T.errReps);

  // Fórmula Epley: 1RM = peso × (1 + reps / 30)
  const rm1 = reps === 1 ? peso : peso * (1 + reps / 30);

  // Porcentajes aproximados para distintos RM
  const rm3 = rm1 * 0.93;
  const rm5 = rm1 * 0.87;
  const rm8 = rm1 * 0.80;
  const rm10 = rm1 * 0.75;
  const rm12 = rm1 * 0.70;

  const mensaje = __lang === 'en'
    ? `Your estimated 1RM is ${rm1.toFixed(1)} kg. For hypertrophy, work with ${rm8.toFixed(1)}–${rm12.toFixed(1)} kg (8–12 reps).`
    : `Tu 1RM estimado es ${rm1.toFixed(1)} kg. Para hipertrofia trabajá con ${rm8.toFixed(1)}–${rm12.toFixed(1)} kg (8–12 reps).`;

  return {
    rm1: Number(rm1.toFixed(1)),
    rm3: Number(rm3.toFixed(1)),
    rm5: Number(rm5.toFixed(1)),
    rm8: Number(rm8.toFixed(1)),
    rm10: Number(rm10.toFixed(1)),
    rm12: Number(rm12.toFixed(1)),
    mensaje,
  };
}
