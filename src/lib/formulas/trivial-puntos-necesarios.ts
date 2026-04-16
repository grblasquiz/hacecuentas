/** Calculadora de Puntos Necesarios para Ganar Trivia */
export interface Inputs { rondas: number; preguntasRonda: number; puntosPregunta: number; equipos: number; nivelEquipo: string; }
export interface Outputs { puntosMaximos: number; puntosParaGanar: number; aciertosNecesarios: number; estrategia: string; }

export function trivialPuntosNecesarios(i: Inputs): Outputs {
  const rondas = Number(i.rondas);
  const ppR = Number(i.preguntasRonda);
  const pts = Number(i.puntosPregunta);
  const eq = Number(i.equipos);
  if (!rondas || rondas < 1) throw new Error('Ingresá las rondas');
  if (!ppR || ppR < 1) throw new Error('Ingresá preguntas por ronda');
  if (!pts || pts < 1) throw new Error('Ingresá puntos por pregunta');
  if (!eq || eq < 1) throw new Error('Ingresá equipos rivales');

  const puntosMaximos = rondas * ppR * pts;

  // Estimate: with N teams, winner typically gets 70-85% of max
  // More teams = lower winning score (more competition distributes correctly)
  const basePct = eq <= 3 ? 0.85 : eq <= 6 ? 0.78 : eq <= 10 ? 0.72 : 0.68;
  const nivelMult: Record<string, number> = { bajo: 1.1, medio: 1.0, alto: 0.9 };
  const mult = nivelMult[i.nivelEquipo] || 1;

  const puntosParaGanar = Math.round(puntosMaximos * basePct * mult);
  const aciertosNecesarios = (puntosParaGanar / puntosMaximos) * 100;

  let estrategia: string;
  if (i.nivelEquipo === 'bajo') {
    estrategia = 'Enfocate en las categorías que dominás. No arriesgues en bonus rounds. Asegurate respuestas fáciles.';
  } else if (eq > 8) {
    estrategia = 'Con muchos equipos, los puntos bonus marcan la diferencia. Apostá en rondas dobles y no dejes preguntas sin responder.';
  } else {
    estrategia = 'Distribución pareja entre categorías es clave. Cada punto cuenta — no dejes preguntas en blanco, adiviná si no sabés.';
  }

  return { puntosMaximos, puntosParaGanar, aciertosNecesarios: Number(aciertosNecesarios.toFixed(0)), estrategia };
}
