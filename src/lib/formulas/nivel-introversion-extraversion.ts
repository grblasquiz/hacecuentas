/** Test introversión vs extraversión */
export interface Inputs { p1: string; p2: string; p3: string; p4: string; p5: string; p6: string; p7: string; p8: string; p9: string; p10: string; }
export interface Outputs { resultado: string; puntaje: number; porcentaje: number; descripcion: string; mensaje: string; }

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

  return {
    resultado, puntaje, porcentaje, descripcion,
    mensaje: `${resultado} (${porcentaje}% introversión). ${descripcion}`
  };
}