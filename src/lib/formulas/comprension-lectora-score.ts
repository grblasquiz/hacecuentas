/** Score de Comprensión Lectora */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  scorePorcentaje: number;
  scoreAjustado: number;
  interpretacion: string;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
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

  const scoreAjustado = Math.round(ajustado);
  const tone: 'good' | 'warn' | 'neutral' =
    scoreAjustado >= 75 ? 'good' : scoreAjustado >= 60 ? 'neutral' : 'warn';

  return {
    scorePorcentaje: Math.round(crudo),
    scoreAjustado,
    interpretacion: interp,
    recomendacion: rec,
    _insight: {
      title: `Comprensión ${interp.toLowerCase()}`,
      text: `Acertaste **${correctas} de ${totales}** preguntas. Ajustado por dificultad ${dif} del texto, tu score es **${scoreAjustado}/100** (${interp}). ${rec}`,
      tone,
      icon: '📖',
    },
    _chart: {
      type: 'scale',
      marker: scoreAjustado,
      markerLabel: `${scoreAjustado} pts`,
      min: 0,
      segments: [
        { nombre: 'Muy bajo', max: 40, color: '#ef4444', colorDark: '#b91c1c' },
        { nombre: 'Bajo', max: 60, color: '#f59e0b', colorDark: '#b45309' },
        { nombre: 'Normal', max: 75, color: '#eab308', colorDark: '#a16207' },
        { nombre: 'Muy bueno', max: 90, color: '#84cc16', colorDark: '#4d7c0f' },
        { nombre: 'Excelente', max: 101, color: '#22c55e', colorDark: '#15803d' },
      ],
      ariaLabel: `Score de comprensión lectora ${scoreAjustado} sobre 100, categoría ${interp}`,
    },
  };

}
