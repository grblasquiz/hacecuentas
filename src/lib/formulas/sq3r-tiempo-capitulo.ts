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

  return {
    survey,
    question,
    read,
    recite,
    review,
    totalMin: total,
  };

}
