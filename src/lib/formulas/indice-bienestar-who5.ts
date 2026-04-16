/** WHO-5 Well-Being Index */
export interface Inputs {
  w1: string; w2: string; w3: string; w4: string; w5: string;
}
export interface Outputs {
  indice: number;
  puntajeRaw: number;
  clasificacion: string;
  mensaje: string;
}

export function indiceBienestarWho5(i: Inputs): Outputs {
  const raw = Number(i.w1) + Number(i.w2) + Number(i.w3) + Number(i.w4) + Number(i.w5);
  const indice = raw * 4;

  let clasificacion: string;
  if (indice > 50) clasificacion = 'Bienestar normal';
  else if (indice >= 28) clasificacion = 'Bienestar bajo — considerá buscar apoyo';
  else clasificacion = 'Bienestar muy bajo — se recomienda evaluación profesional';

  return {
    indice,
    puntajeRaw: raw,
    clasificacion,
    mensaje: `WHO-5: ${indice}/100 (raw: ${raw}/25). ${clasificacion}.`
  };
}