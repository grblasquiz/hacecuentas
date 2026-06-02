/** Tiempo SQ3R por capítulo */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  survey: number;
  question: number;
  read: number;
  recite: number;
  review: number;
  totalMin: number;
  _insight?: any;
  _chart?: any;
}

export function sq3rTiempoCapitulo(i: Inputs): Outputs {
  const pag = Number(i.paginas) || 20;
  const comp = String(i.complejidad || 'media');
  if (pag <= 0) throw new Error('Páginas inválidas');

  const MINPAG: Record<string, number> = { baja: 2, media: 3, alta: 5 };
  const mpp = MINPAG[comp] || 3;

  const survey = Math.round(pag * 0.4);
  const question = Math.round(pag * 0.5);
  const read = Math.round(pag * mpp);
  const recite = Math.round(pag * 1);
  const review = Math.round(pag * 0.75);

  const total = survey + question + read + recite + review;

  const horas = Math.floor(total / 60);
  const mins = total % 60;
  const tiempoTxt = horas > 0 ? `${horas} h ${mins} min` : `${total} min`;
  const pctLectura = total > 0 ? Math.round((read / total) * 100) : 0;
  const insight = {
    title: 'Tu plan de estudio SQ3R',
    text: `Aplicar SQ3R a este capítulo de ${pag} páginas (${comp}) te lleva unos **${tiempoTxt}**. La etapa de lectura (**${read} min**) se lleva el **${pctLectura}%** del tiempo; el resto va a explorar, preguntarte y repasar para fijar lo aprendido.`,
    tone: 'neutral' as const,
    icon: '📚',
  };
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Survey (explorar)', value: survey },
      { label: 'Question (preguntar)', value: question },
      { label: 'Read (leer)', value: read },
      { label: 'Recite (recitar)', value: recite },
      { label: 'Review (repasar)', value: review },
    ],
    centerValue: tiempoTxt,
    centerLabel: 'Total',
    ariaLabel: 'Distribución del tiempo de estudio entre las cinco etapas del método SQ3R',
  };

  return {
    survey,
    question,
    read,
    recite,
    review,
    totalMin: total,
    _insight: insight,
    _chart: chart,
  };

}
