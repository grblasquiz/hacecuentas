/** Índice cintura-cadera — riesgo cardiovascular */
export interface Inputs {
  cintura: number;
  cadera: number;
  sexo: string;
}
export interface Outputs {
  icc: number;
  riesgo: string;
  clasificacion: string;
  mensaje: string;
  _chart?: any;
}

export function indiceCinturaCadera(i: Inputs): Outputs {
  const cintura = Number(i.cintura);
  const cadera = Number(i.cadera);
  const sexo = String(i.sexo || 'm');
  if (!cintura || cintura <= 0) throw new Error('Ingresá la medida de cintura');
  if (!cadera || cadera <= 0) throw new Error('Ingresá la medida de cadera');

  const icc = cintura / cadera;

  let riesgo: string;
  let clasificacion: string;

  if (sexo === 'f') {
    if (icc < 0.75) { riesgo = 'Bajo'; clasificacion = 'Distribución ginecoide (grasa en cadera/muslos)'; }
    else if (icc <= 0.85) { riesgo = 'Moderado'; clasificacion = 'Distribución equilibrada'; }
    else { riesgo = 'Alto'; clasificacion = 'Distribución androide (grasa abdominal) — mayor riesgo cardiovascular'; }
  } else {
    if (icc < 0.85) { riesgo = 'Bajo'; clasificacion = 'Distribución equilibrada'; }
    else if (icc <= 0.95) { riesgo = 'Moderado'; clasificacion = 'Distribución intermedia'; }
    else { riesgo = 'Alto'; clasificacion = 'Distribución androide (grasa abdominal) — mayor riesgo cardiovascular'; }
  }

  const topSeg = Math.max(1.1, Math.ceil(icc * 10) / 10 + 0.1);
  const segments = sexo === 'f'
    ? [
        { nombre: 'Bajo', max: 0.75, color: '#bbf7d0', colorDark: '#166534' },
        { nombre: 'Moderado', max: 0.85, color: '#fde68a', colorDark: '#b45309' },
        { nombre: 'Alto', max: topSeg, color: '#fecaca', colorDark: '#b91c1c' },
      ]
    : [
        { nombre: 'Bajo', max: 0.85, color: '#bbf7d0', colorDark: '#166534' },
        { nombre: 'Moderado', max: 0.95, color: '#fde68a', colorDark: '#b45309' },
        { nombre: 'Alto', max: topSeg, color: '#fecaca', colorDark: '#b91c1c' },
      ];

  const chart = {
    type: 'scale' as const,
    marker: Number(icc.toFixed(3)),
    markerLabel: 'Tu ICC: ' + icc.toFixed(2),
    min: 0.6,
    unit: '',
    segments,
    ariaLabel: 'Escala de índice cintura-cadera y riesgo cardiovascular según sexo.',
  };

  return {
    icc: Number(icc.toFixed(3)),
    riesgo,
    clasificacion,
    mensaje: `ICC: ${icc.toFixed(3)} — Riesgo cardiovascular: ${riesgo}. ${clasificacion}.`,
    _chart: chart,
  };
}
