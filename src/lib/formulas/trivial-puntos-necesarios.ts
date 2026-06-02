/** Calculadora de Puntos Necesarios para Ganar Trivia */
export interface Inputs { rondas: number; preguntasRonda: number; puntosPregunta: number; equipos: number; nivelEquipo: string; }
export interface Outputs { puntosMaximos: number; puntosParaGanar: number; aciertosNecesarios: number; estrategia: string; _insight?: any; _chart?: any; }

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

  const pct = Number(aciertosNecesarios.toFixed(0));
  const tono = pct >= 80 ? 'warn' : 'neutral';
  const _insight = {
    title: 'Cuánto hay que sumar',
    text: pct >= 80
      ? `Con **${eq} equipos**, para ganar apuntá a **${puntosParaGanar} de ${puntosMaximos} puntos**: eso es un **${pct}% de aciertos**, un listón exigente que casi no perdona errores.`
      : `Con **${eq} equipos**, para ganar alcanza con **${puntosParaGanar} de ${puntosMaximos} puntos**, equivalente a un **${pct}% de aciertos**. Hay margen para fallar algunas y aún así quedar arriba.`,
    tone: tono as 'warn' | 'neutral',
    icon: '🧠',
  };
  const _chart = {
    type: 'scale' as const,
    marker: pct,
    markerLabel: `${pct}% para ganar`,
    min: 0,
    segments: [
      { nombre: 'Holgado', max: 60, color: '#86efac', colorDark: '#15803d' },
      { nombre: 'Parejo', max: 80, color: '#fde047', colorDark: '#a16207' },
      { nombre: 'Exigente', max: 100, color: '#fca5a5', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Se necesita un ${pct}% de aciertos para ganar la trivia`,
  };

  return { puntosMaximos, puntosParaGanar, aciertosNecesarios: pct, estrategia, _insight, _chart };
}
