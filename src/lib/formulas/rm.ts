/** 1RM — peso máximo levantable (Epley, Brzycki, Lombardi) */
export interface Inputs { peso: number; repeticiones: number; __lang?: string; }
export interface Outputs {
  rmEpley: number;
  rmBrzycki: number;
  rmLombardi: number;
  promedio: number;
  porcentajes: Array<{ pct: number; peso: number; reps: number }>;
  _insight?: any;
}

export function rm(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errPeso: 'Ingresá el peso levantado',
      errReps: 'Las repeticiones deben estar entre 1 y 15 para buena precisión',
      insTitle: 'Tu 1RM estimado',
      insExact: (rm: number) => `Con esa serie tu 1RM ronda los **${rm} kg** (promedio de Epley, Brzycki y Lombardi). Al hacerla a pocas repeticiones, las tres fórmulas coinciden bien y el número es confiable.`,
      insLoose: (rm: number, reps: number) => `Tu 1RM estimado es de **${rm} kg**, pero al hacer **${reps} reps** la fatiga y la técnica dispersan las fórmulas: tomalo como referencia y validalo con una serie de 3-5 reps.`,
    },
    en: {
      errPeso: 'Enter the weight lifted',
      errReps: 'Repetitions must be between 1 and 15 for good accuracy',
      insTitle: 'Your estimated 1RM',
      insExact: (rm: number) => `With that set your 1RM is around **${rm} kg** (average of Epley, Brzycki and Lombardi). Done at low reps, the three formulas agree well and the number is reliable.`,
      insLoose: (rm: number, reps: number) => `Your estimated 1RM is **${rm} kg**, but at **${reps} reps** fatigue and form spread the formulas apart: treat it as a reference and validate it with a 3-5 rep set.`,
    },
  } as const)[__lang];
  const peso = Number(i.peso);
  const reps = Number(i.repeticiones);
  if (!peso || peso <= 0) throw new Error(T.errPeso);
  if (!reps || reps <= 0 || reps > 15) throw new Error(T.errReps);

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

  const promedioRound = Math.round(promedio * 10) / 10;
  const reliable = reps <= 6;

  return {
    rmEpley: Math.round(epley * 10) / 10,
    rmBrzycki: Math.round(brzycki * 10) / 10,
    rmLombardi: Math.round(lombardi * 10) / 10,
    promedio: promedioRound,
    porcentajes,
    _insight: {
      title: T.insTitle,
      text: reliable ? T.insExact(promedioRound) : T.insLoose(promedioRound, reps),
      tone: reliable ? 'good' : 'warn',
      icon: '🏋️',
    },
  };
}
