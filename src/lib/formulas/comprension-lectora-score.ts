/** Score de Comprensión Lectora */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  scorePorcentaje: number;
  scoreAjustado: number;
  interpretacion: string;
  recomendacion: string;
}

export function comprensionLectoraScore(i: Inputs): Outputs {
  const correctas = Number(i.preguntasCorrectas) || 0;
  const totales = Number(i.preguntasTotales) || 1;
  const dif = String(i.dificultadTexto || 'media');
  if (totales <= 0) throw new Error('Preguntas totales inválido');
  if (correctas > totales) throw new Error('Correctas no puede superar totales');

  const crudo = (correctas / totales) * 100;
  const FACTOR: Record<string, number> = { baja: 0.9, media: 1.0, alta: 1.1 };
  const ajustado = Math.min(100, crudo * (FACTOR[dif] || 1));

  let interp = '';
  if (ajustado >= 90) interp = 'Excelente';
  else if (ajustado >= 75) interp = 'Muy bueno';
  else if (ajustado >= 60) interp = 'Normal';
  else if (ajustado >= 40) interp = 'Bajo';
  else interp = 'Muy bajo';

  let rec = '';
  if (ajustado < 60) rec = 'Considerá bajar velocidad o ampliar vocabulario base.';
  else if (ajustado < 80) rec = 'Buena base. Practicá SQ3R y resúmenes.';
  else rec = 'Sólido. Desafiate con textos más densos.';

  return {
    scorePorcentaje: Math.round(crudo),
    scoreAjustado: Math.round(ajustado),
    interpretacion: interp,
    recomendacion: rec,
  };

}
