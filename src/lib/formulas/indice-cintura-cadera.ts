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

  return {
    icc: Number(icc.toFixed(3)),
    riesgo,
    clasificacion,
    mensaje: `ICC: ${icc.toFixed(3)} — Riesgo cardiovascular: ${riesgo}. ${clasificacion}.`,
  };
}
