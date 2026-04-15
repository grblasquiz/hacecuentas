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

  return {
    puntaje,
    riesgo: `${riesgo} — Probabilidad a 10 años: ${probabilidad}. ${recomendacion}`,
    detalle,
  };
}
