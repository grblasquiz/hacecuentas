/** Calculadora RM por fórmulas Epley y Brzycki */
export interface Inputs {
  peso: number;
  repeticiones: number;
  formula: string;
}
export interface Outputs {
  rm1Epley: number;
  rm1Brzycki: number;
  promedio: number;
  diferencia: number;
  mensaje: string;
  _insight?: any;
}

export function repeticionesMaximasEpley(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const reps = Number(i.repeticiones);
  if (!peso || peso <= 0) throw new Error('Ingresá el peso levantado');
  if (!reps || reps < 2 || reps > 30) throw new Error('Ingresá entre 2 y 30 repeticiones');

  // Epley: 1RM = peso × (1 + reps/30)
  const epley = peso * (1 + reps / 30);

  // Brzycki: 1RM = peso × 36 / (37 - reps)
  const brzycki = peso * 36 / (37 - reps);

  const promedio = (epley + brzycki) / 2;
  const diferencia = Math.abs(epley - brzycki);

  // Insight: a muchas reps Epley y Brzycki se separan y el 1RM pierde fiabilidad.
  const altasReps = reps > 12 || diferencia > promedio * 0.06;
  const pct80 = promedio * 0.8;
  const insight = {
    title: altasReps ? 'Estimación menos fiable' : 'Tu 1RM estimado',
    text: altasReps
      ? `Con **${reps} reps** Epley y Brzycki difieren **${diferencia.toFixed(1)} kg**: a tantas repeticiones la estimación se vuelve imprecisa. Hacé una serie de **3-5 reps** para afinar. Promedio actual: **${promedio.toFixed(1)} kg**.`
      : `Tu 1RM ronda los **${promedio.toFixed(1)} kg** (Epley ${epley.toFixed(1)} / Brzycki ${brzycki.toFixed(1)}, apenas **${diferencia.toFixed(1)} kg** de diferencia). Para fuerza, el 80% son **~${pct80.toFixed(1)} kg**.`,
    tone: altasReps ? 'warn' as const : 'good' as const,
    icon: '🏋️',
  };

  return {
    rm1Epley: Number(epley.toFixed(1)),
    rm1Brzycki: Number(brzycki.toFixed(1)),
    promedio: Number(promedio.toFixed(1)),
    diferencia: Number(diferencia.toFixed(1)),
    mensaje: `Epley: ${epley.toFixed(1)} kg | Brzycki: ${brzycki.toFixed(1)} kg | Promedio: ${promedio.toFixed(1)} kg.`,
    _insight: insight,
  };
}
