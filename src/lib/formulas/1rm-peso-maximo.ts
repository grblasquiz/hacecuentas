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
  _insight?: any;
}

export function rmPesoMaximo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errPeso: 'Ingresá el peso levantado',
      errReps: 'Ingresá entre 1 y 30 repeticiones',
      insightTitle: 'Tu 1RM y zonas de entrenamiento',
    },
    en: {
      errPeso: 'Enter the weight lifted',
      errReps: 'Enter between 1 and 30 repetitions',
      insightTitle: 'Your 1RM and training zones',
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

  // --- Insight narrativo ---
  const rm1f = rm1.toFixed(1);
  // rm8 (80%) > rm12 (70%); presentar el rango de hipertrofia de menor a mayor
  const rm8f = rm8.toFixed(1);
  const rm12f = rm12.toFixed(1);
  const hipLo = rm12f; // 70%
  const hipHi = rm8f;  // 80%
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (reps === 1) {
    insightTone = 'good';
    insightText = __lang === 'en'
      ? `With 1 rep, **${peso} kg is your true 1RM**. For pure strength train at 85–95% (**${(rm1 * 0.85).toFixed(1)}–${(rm1 * 0.95).toFixed(1)} kg**); for muscle, **${rm8f}–${rm12f} kg**.`
      : `Con 1 rep, **${peso} kg es tu 1RM real**. Para fuerza pura entrená al 85–95% (**${(rm1 * 0.85).toFixed(1)}–${(rm1 * 0.95).toFixed(1)} kg**); para músculo, **${rm8f}–${rm12f} kg**.`;
  } else if (reps <= 6) {
    insightTone = 'good';
    insightText = __lang === 'en'
      ? `From **${peso} kg × ${reps} reps**, your 1RM is **${rm1f} kg** — a reliable estimate. Train hypertrophy at **${rm8f}–${rm12f} kg** (8–12 reps).`
      : `Desde **${peso} kg × ${reps} reps**, tu 1RM es **${rm1f} kg** — estimación confiable. Entrená hipertrofia con **${rm8f}–${rm12f} kg** (8–12 reps).`;
  } else {
    insightTone = 'warn';
    insightText = __lang === 'en'
      ? `With **${reps} reps** the **${rm1f} kg** estimate carries over ~10% error. Retest at 3–6 reps to nail your 1RM; for now train muscle at **${rm8f}–${rm12f} kg**.`
      : `Con **${reps} reps** el **${rm1f} kg** arrastra un error de ~10%. Repetí el test con 3–6 reps para afinarlo; por ahora entrená músculo con **${rm8f}–${rm12f} kg**.`;
  }
  const insight = {
    title: T.insightTitle,
    text: insightText,
    tone: insightTone,
    icon: '🏋️',
  };

  return {
    rm1: Number(rm1.toFixed(1)),
    rm3: Number(rm3.toFixed(1)),
    rm5: Number(rm5.toFixed(1)),
    rm8: Number(rm8.toFixed(1)),
    rm10: Number(rm10.toFixed(1)),
    rm12: Number(rm12.toFixed(1)),
    mensaje,
    _insight: insight,
  };
}
