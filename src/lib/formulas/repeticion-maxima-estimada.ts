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
  _insight?: any;
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

  // Insight: el 1RM estimado pierde precisión a muchas reps; la dispersión entre
  // fórmulas avisa cuánto confiar en el número.
  const dispersionPct = (diff / promedio) * 100;
  const pocoConfiable = reps > 10 || dispersionPct > 6;
  const pct80 = promedio * 0.8;
  const insight = {
    title: pocoConfiable ? 'Estimación menos precisa' : 'Tu 1RM estimado',
    text: pocoConfiable
      ? `Con **${reps} reps** las fórmulas se separan **${diff.toFixed(1)} kg** (${dispersionPct.toFixed(0)}%): a tantas repeticiones el 1RM pierde precisión. Para afinar, probá una serie de **3-5 reps**. Estimado actual: **${promedio.toFixed(1)} kg**.`
      : `Tu 1RM estimado es **${promedio.toFixed(1)} kg** y las 4 fórmulas coinciden dentro de **${diff.toFixed(1)} kg**, así que es confiable. Para entrenar fuerza, el 80% son **~${pct80.toFixed(1)} kg**.`,
    tone: pocoConfiable ? 'warn' as const : 'good' as const,
    icon: '🏋️',
  };

  return {
    promedio: Number(promedio.toFixed(1)),
    epley: Number(epley.toFixed(1)),
    brzycki: Number(brzycki.toFixed(1)),
    lander: Number(lander.toFixed(1)),
    lombardi: Number(lombardi.toFixed(1)),
    mensaje: `1RM promedio: ${promedio.toFixed(1)} kg (dispersión entre fórmulas: ${diff.toFixed(1)} kg). Usá el promedio como referencia.`,
    _insight: insight,
  };
}