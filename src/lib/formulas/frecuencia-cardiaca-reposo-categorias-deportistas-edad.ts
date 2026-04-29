export interface Inputs {
  resting_heart_rate: number;
  age: number;
  activity_level: string;
}

export interface Outputs {
  category: string;
  range_min: number;
  range_max: number;
  status: string;
  recommendation: string;
}

export function compute(i: Inputs): Outputs {
  const rhr = Number(i.resting_heart_rate) || 0;
  const age = Number(i.age) || 0;
  const activityLevel = String(i.activity_level || 'moderate').toLowerCase();

  // Validaciones básicas
  if (rhr <= 0 || age <= 0 || age > 120) {
    return {
      category: 'Datos inválidos',
      range_min: 0,
      range_max: 0,
      status: 'Error',
      recommendation: 'Ingresa edad y FC reposo válidas.'
    };
  }

  // Definir rangos normales según nivel de actividad
  let rangeMin: number, rangeMax: number;
  let activityLabel: string;

  switch (activityLevel) {
    case 'sedentary':
      rangeMin = 60;
      rangeMax = 100;
      activityLabel = 'Sedentario';
      break;
    case 'moderate':
      rangeMin = 55;
      rangeMax = 80;
      activityLabel = 'Moderado';
      break;
    case 'active':
      rangeMin = 50;
      rangeMax = 70;
      activityLabel = 'Activo';
      break;
    case 'athlete':
      rangeMin = 35;
      rangeMax = 60;
      activityLabel = 'Atleta';
      break;
    default:
      rangeMin = 55;
      rangeMax = 80;
      activityLabel = 'Moderado';
  }

  // Determinar categoría y estado
  let category: string;
  let status: string;
  let recommendation: string;

  if (rhr < 40) {
    if (activityLevel === 'athlete') {
      category = 'Bradicardia fisiológica (atleta)';
      status = 'Óptimo';
      recommendation = 'Excelente condición cardiovascular. Mantén tu entrenamiento. Monitorea cambios anormales.';
    } else {
      category = 'Bradicardia';
      status = 'Requiere evaluación médica';
      recommendation = 'Tu FC reposo es muy baja. Consulta a un cardiólogo para descartar bradicardia patológica.';
    }
  } else if (rhr >= rangeMin && rhr <= rangeMax) {
    category = 'Normal';
    status = 'Saludable';
    recommendation = `Tu FC reposo está dentro del rango normal para tu edad y nivel de actividad (${rangeMin}–${rangeMax} lpm). Mantén tu actual nivel de actividad.`;
  } else if (rhr > rangeMax && rhr <= 100) {
    category = 'Elevada';
    status = 'Por encima del rango';
    recommendation = `Tu FC reposo es más alta que la esperada (${rhr} lpm > ${rangeMax} lpm). Considera aumentar actividad aeróbica, reducir estrés y cafeína.`;
  } else {
    category = 'Taquicardia';
    status = 'Requiere evaluación médica';
    recommendation = 'Tu FC reposo es muy elevada (>100 lpm en reposo). Consulta a un médico para evaluar estrés, medicamentos, infecciones o condiciones cardíacas.';
  }

  return {
    category,
    range_min: rangeMin,
    range_max: rangeMax,
    status,
    recommendation
  };
}
