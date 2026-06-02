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
  _insight?: any;
  _chart?: any;
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

  // Tono dinámico según categoría
  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  if (category === 'Normal' || status === 'Óptimo') tone = 'good';
  else if (category === 'Bradicardia' || category === 'Taquicardia' || category === 'Elevada') tone = 'warn';

  const insightText =
    category === 'Normal'
      ? `Tu FC en reposo de **${rhr} lpm** cae dentro del rango saludable para un perfil ${activityLabel.toLowerCase()} (${rangeMin}–${rangeMax} lpm). Buena señal cardiovascular: sostené tu nivel de actividad.`
      : category.startsWith('Bradicardia')
      ? status === 'Óptimo'
        ? `**${rhr} lpm** en reposo es bradicardia fisiológica de atleta: un corazón muy eficiente. Normal con tu nivel de entrenamiento; vigilá solo cambios bruscos.`
        : `Tu FC en reposo (**${rhr} lpm**) está por debajo de 40 sin un perfil atlético que lo justifique. Conviene una evaluación cardiológica para descartar bradicardia patológica.`
      : category === 'Elevada'
      ? `Tu FC en reposo (**${rhr} lpm**) supera el rango esperado para tu perfil (hasta ${rangeMax} lpm). Más actividad aeróbica, menos cafeína y mejor descanso suelen bajarla.`
      : `Tu FC en reposo (**${rhr} lpm**) está en rango de taquicardia (>100 lpm en reposo). Consultá a un médico para descartar estrés, fiebre, medicación o causas cardíacas.`;

  // Escala de FC en reposo (lpm). Marker = rhr, segmentos estrictamente ascendentes que siempre lo superan.
  const segCap = Math.max(110, rhr + 10);
  const rawSegs = [
    { nombre: 'Baja / atleta', max: rangeMin, color: '#3b82f6', colorDark: '#60a5fa' },
    { nombre: 'Normal', max: rangeMax, color: '#22c55e', colorDark: '#4ade80' },
    { nombre: 'Elevada', max: 100, color: '#eab308', colorDark: '#facc15' },
    { nombre: 'Taquicardia', max: segCap, color: '#ef4444', colorDark: '#f87171' },
  ];
  // Quitar segmentos cuyo max no supera al anterior (evita colisiones como sedentario rangeMax=100)
  const segments: typeof rawSegs = [];
  let prevMax = 30;
  for (const s of rawSegs) {
    if (s.max > prevMax) {
      segments.push(s);
      prevMax = s.max;
    }
  }
  return {
    category,
    range_min: rangeMin,
    range_max: rangeMax,
    status,
    recommendation,
    _insight: {
      title: `FC reposo: ${category}`,
      text: insightText,
      tone,
      icon: '❤️',
    },
    _chart: {
      type: 'scale',
      marker: rhr,
      markerLabel: `${rhr} lpm`,
      min: 30,
      segments,
      ariaLabel: `Frecuencia cardíaca en reposo de ${rhr} lpm clasificada como ${category}`,
    },
  };
}
