/** Cuestionario FINDRISC — Riesgo de diabetes tipo 2 a 10 años */
export interface Inputs {
  edad: string;
  imc: string;
  cintura: string;
  actividad: string;
  alimentacion: string;
  medicacion: string;
  glucemiaAlta: string;
  familiarDiabetes: string;
}
export interface Outputs {
  puntaje: number;
  riesgo: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function riesgoDiabetesFindrisc(i: Inputs): Outputs {
  const puntaje =
    Number(i.edad || 0) +
    Number(i.imc || 0) +
    Number(i.cintura || 0) +
    Number(i.actividad || 0) +
    Number(i.alimentacion || 0) +
    Number(i.medicacion || 0) +
    Number(i.glucemiaAlta || 0) +
    Number(i.familiarDiabetes || 0);

  let riesgo: string;
  let probabilidad: string;
  let recomendacion: string;

  if (puntaje < 7) {
    riesgo = 'Bajo';
    probabilidad = '~1%';
    recomendacion = 'Mantené hábitos saludables. Control de rutina.';
  } else if (puntaje <= 11) {
    riesgo = 'Levemente elevado';
    probabilidad = '~4%';
    recomendacion = 'Mejorá alimentación y aumentá actividad física.';
  } else if (puntaje <= 14) {
    riesgo = 'Moderado';
    probabilidad = '~17%';
    recomendacion = 'Consultá a tu médico. Hacete una glucemia en ayunas.';
  } else if (puntaje <= 20) {
    riesgo = 'Alto';
    probabilidad = '~33%';
    recomendacion = 'Evaluación médica prioritaria. Análisis de glucemia y HbA1c.';
  } else {
    riesgo = 'Muy alto';
    probabilidad = '~50%';
    recomendacion = 'Evaluación médica urgente. Alta probabilidad de prediabetes o diabetes.';
  }

  const detalle =
    `Puntaje FINDRISC: ${puntaje}/26 | ` +
    `Riesgo: ${riesgo} | ` +
    `Probabilidad de diabetes tipo 2 en 10 años: ${probabilidad} | ` +
    `${recomendacion}`;

  const chart = {
    type: 'scale' as const,
    marker: puntaje,
    markerLabel: 'Tu puntaje: ' + puntaje,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Bajo', max: 7, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Leve', max: 12, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Moderado', max: 15, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Alto', max: 21, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Muy alto', max: Math.max(26, Math.ceil(puntaje) + 1), color: '#fca5a5', colorDark: '#991b1b' },
    ],
    ariaLabel: 'Escala FINDRISC de riesgo de diabetes tipo 2: tu puntaje ' + puntaje + ' sobre 26',
  };

  const tone = puntaje < 12 ? (puntaje < 7 ? 'good' as const : 'neutral' as const) : 'warn' as const;
  const _insight = {
    title: 'Qué significa tu puntaje',
    text: `Tu FINDRISC es **${puntaje}/26**, lo que ubica tu riesgo de diabetes tipo 2 a 10 años como **${riesgo.toLowerCase()}** (~**${probabilidad}** de probabilidad). ` +
      (puntaje < 7
        ? 'Un riesgo bajo: sostené tus hábitos y alcanzá con un control de rutina.'
        : puntaje <= 11
        ? 'Levemente elevado: mejorar la alimentación y sumar actividad física ahora reduce mucho el riesgo a futuro.'
        : puntaje <= 14
        ? 'Moderado: conviene una glucemia en ayunas y poner foco en dieta y movimiento.'
        : 'Es momento de una evaluación médica (glucemia y HbA1c); cuanto antes actúes, más fácil es revertirlo.'),
    tone,
    icon: puntaje < 7 ? '🟢' : puntaje <= 11 ? '🩸' : '⚠️',
  };

  return {
    puntaje,
    riesgo: `${riesgo} — Probabilidad a 10 años: ${probabilidad}. ${recomendacion}`,
    detalle,
    _insight,
    _chart: chart,
  };
}
