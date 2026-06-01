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
  _chart?: any;
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
  const dif = Number(diferencial.toFixed(1));

  const chart = {
    type: 'scale' as const,
    marker: dif,
    markerLabel: 'Tu diferencial: ' + dif,
    min: Math.min(0, Math.floor(dif)),
    unit: '',
    segments: [
      { nombre: 'Scratch / avanzado', max: 5, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Single digit', max: 10, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Intermedio', max: 18, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Principiante-intermedio', max: 28, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Principiante', max: Math.max(36, Math.ceil(dif) + 2), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de handicap de golf: el diferencial menor indica mejor nivel de juego',
  };

  return {
    result: dif,
    hcpEstimado: dif,
    golpesSobrePar: Number(golpesSobre.toFixed(1)),
    detalle: `Con score **${score}** en un campo de CR ${cr} y Slope ${slope}, tu diferencial es **${diferencial.toFixed(1)}**. Jugaste ${golpesSobre.toFixed(1)} golpes sobre el Course Rating.`,
    _chart: chart,
  };
}
