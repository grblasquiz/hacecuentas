/** Test introversión vs extraversión */
export interface Inputs { p1: string; p2: string; p3: string; p4: string; p5: string; p6: string; p7: string; p8: string; p9: string; p10: string; }
export interface Outputs { resultado: string; puntaje: number; porcentaje: number; descripcion: string; mensaje: string; _chart?: any; _insight?: any; }

export function nivelIntroversionExtraversion(i: Inputs): Outputs {
  // Introversion items: p1, p2, p3, p5, p7, p9 (higher = more introverted)
  // Extraversion items: p4, p6, p8, p10 (higher = more extraverted, reverse for intro score)
  const introItems = Number(i.p1) + Number(i.p2) + Number(i.p3) + Number(i.p5) + Number(i.p7) + Number(i.p9);
  const extraItems = (6 - Number(i.p4)) + (6 - Number(i.p6)) + (6 - Number(i.p8)) + (6 - Number(i.p10));
  const puntaje = introItems + extraItems; // 10-50, higher = more introverted
  const porcentaje = Math.round((puntaje / 50) * 100);

  let resultado: string;
  let descripcion: string;
  if (puntaje >= 40) {
    resultado = 'Fuertemente introvertido/a';
    descripcion = 'Recargás energía en soledad. Preferís profundidad sobre amplitud en relaciones. Pensás antes de hablar. Te sentís drenado/a por socialización extensa.';
  } else if (puntaje >= 33) {
    resultado = 'Introvertido/a';
    descripcion = 'Tendés a la introversión. Disfrutás la compañía de otros en dosis moderadas pero necesitás tiempo a solas para recargar.';
  } else if (puntaje >= 27) {
    resultado = 'Ambivertido/a (tendencia introvertida)';
    descripcion = 'Estás en el medio con leve tendencia introvertida. Te adaptás bien a ambos contextos pero ligeramente preferís entornos más tranquilos.';
  } else if (puntaje >= 21) {
    resultado = 'Ambivertido/a (tendencia extravertida)';
    descripcion = 'Estás en el medio con leve tendencia extravertida. Disfrutás socializar y también el tiempo solo, pero ligeramente preferís la compañía.';
  } else if (puntaje >= 15) {
    resultado = 'Extravertido/a';
    descripcion = 'Recargás energía con otros. Te gusta la variedad social, pensás en voz alta y disfrutás ser parte de grupos grandes.';
  } else {
    resultado = 'Fuertemente extravertido/a';
    descripcion = 'Necesitás interacción social para sentirte bien. La soledad prolongada te drena. Sos el alma de la fiesta y hacés amigos en todas partes.';
  }

  const insight = {
    title: `Resultado: ${resultado}`,
    text: `Obtuviste **${puntaje}/50** en el eje introversión-extraversión (**${porcentaje}% introversión**), lo que te ubica como **${resultado.toLowerCase()}**. ${porcentaje >= 50 ? 'Recargás más en la calma que en el estímulo social.' : 'Recargás más en el contacto social que en la soledad.'}`,
    tone: 'neutral',
    icon: porcentaje >= 50 ? '🧘' : '🎉',
  };
  const chart = {
    type: 'scale' as const,
    marker: puntaje,
    markerLabel: `${puntaje}/50`,
    min: 10,
    segments: [
      { nombre: 'Muy extravertido', max: 15, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Extravertido', max: 21, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Ambivertido (extra)', max: 27, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Ambivertido (intro)', max: 33, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Introvertido', max: 40, color: '#0ea5e9', colorDark: '#38bdf8' },
      { nombre: 'Muy introvertido', max: Math.max(50, puntaje + 1), color: '#6366f1', colorDark: '#818cf8' },
    ],
    ariaLabel: `Puntaje de ${puntaje} sobre 50 en el eje introversión-extraversión, ${porcentaje}% introversión`,
  };
  return {
    resultado, puntaje, porcentaje, descripcion,
    mensaje: `${resultado} (${porcentaje}% introversión). ${descripcion}`,
    _chart: chart,
    _insight: insight,
  };
}