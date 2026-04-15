/** Cálculo de diferencial de handicap de golf (WHS) */
export interface Inputs {
  score: number;
  courseRating: number;
  slopeRating: number;
}

export interface Outputs {
  result: number;
  hcpEstimado: number;
  golpesSobrePar: number;
  detalle: string;
}

export function handicapGolfDiferencial(i: Inputs): Outputs {
  const score = Number(i.score);
  const cr = Number(i.courseRating);
  const slope = Number(i.slopeRating);

  if (!score || score <= 0) throw new Error('Ingresá tu score (golpes totales)');
  if (!cr || cr <= 0) throw new Error('Ingresá el Course Rating del campo');
  if (!slope || slope <= 0) throw new Error('Ingresá el Slope Rating del campo');
  if (slope < 55 || slope > 155) throw new Error('El Slope Rating debe estar entre 55 y 155');

  const diferencial = ((score - cr) * 113) / slope;
  const golpesSobre = score - cr;

  return {
    result: Number(diferencial.toFixed(1)),
    hcpEstimado: Number(diferencial.toFixed(1)),
    golpesSobrePar: Number(golpesSobre.toFixed(1)),
    detalle: `Con score **${score}** en un campo de CR ${cr} y Slope ${slope}, tu diferencial es **${diferencial.toFixed(1)}**. Jugaste ${golpesSobre.toFixed(1)} golpes sobre el Course Rating.`,
  };
}
