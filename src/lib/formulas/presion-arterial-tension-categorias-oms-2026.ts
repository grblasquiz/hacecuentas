export interface Inputs {
  sistolica: number;
  diastolica: number;
  edad: number;
}

export interface Outputs {
  categoria: string;
  clasificacion_numerica: number;
  riesgo_descripcion: string;
  recomendacion: string;
  _chart?: any;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const sistolica = Number(i.sistolica) || 0;
  const diastolica = Number(i.diastolica) || 0;
  const edad = Number(i.edad) || 18;

  // Validación básica
  if (sistolica < 0 || diastolica < 0 || edad < 18) {
    return {
      categoria: "Datos inválidos",
      clasificacion_numerica: -1,
      riesgo_descripcion: "Por favor ingresa valores válidos (presión ≥0, edad ≥18)",
      recomendacion: "Verifica tus mediciones e intenta nuevamente"
    };
  }

  // Clasificación según criterios OMS/AHA 2026
  let categoria = "";
  let clasificacion_numerica = 0;
  let riesgo_descripcion = "";
  let recomendacion = "";

  if (sistolica > 180 || diastolica > 120) {
    // Crisis Hipertensiva
    categoria = "Crisis Hipertensiva";
    clasificacion_numerica = 4;
    riesgo_descripcion = "Riesgo muy alto. Emergencia médica potencial.";
    recomendacion = "Busca atención médica de emergencia inmediatamente. Si experimentas dolor de pecho, dificultad respiratoria o dolor de cabeza severo, llama a emergencias.";
  } else if (sistolica >= 140 || diastolica >= 90) {
    // Hipertensión Estadio 2
    categoria = "Hipertensión Estadio 2";
    clasificacion_numerica = 3;
    riesgo_descripcion = "Riesgo alto de enfermedad cardiovascular.";
    recomendacion = "Requiere evaluación y tratamiento médico. Consulta a tu médico para posible prescripción de medicamentos y modificaciones en estilo de vida.";
  } else if (sistolica >= 130 || diastolica >= 80) {
    // Hipertensión Estadio 1
    categoria = "Hipertensión Estadio 1";
    clasificacion_numerica = 2;
    riesgo_descripcion = "Riesgo moderado. Requiere seguimiento médico.";
    recomendacion = "Inicia cambios en estilo de vida: ejercicio regular (150 min/semana), dieta baja en sodio (<2.3 g/día), reducir estrés. Consulta médico para seguimiento.";
  } else if (sistolica >= 120 && diastolica < 80) {
    // Elevada
    categoria = "Elevada";
    clasificacion_numerica = 1;
    riesgo_descripcion = "Zona de alerta. Riesgo bajo actualmente pero requiere atención.";
    recomendacion = "Adopta cambios preventivos en estilo de vida: ejercicio, alimentación saludable (dieta DASH), limitar sal y cafeína, manejar estrés. Repite mediciones regularmente.";
  } else {
    // Normal
    categoria = "Normal";
    clasificacion_numerica = 0;
    riesgo_descripcion = "Presión arterial óptima. Riesgo cardiovascular bajo.";
    recomendacion = "Mantén tu presión en este rango mediante estilo de vida saludable: ejercicio regular, alimentación equilibrada, sueño adecuado, manejo de estrés. Mide periódicamente.";
  }

  const chart = {
    type: 'scale' as const,
    marker: sistolica,
    markerLabel: 'Tu sistólica: ' + sistolica + ' mmHg',
    min: 90,
    unit: ' mmHg',
    segments: [
      { nombre: 'Normal', max: 120, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Elevada', max: 130, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'HTA Estadio 1', max: 140, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'HTA Estadio 2', max: 180, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Crisis', max: Math.max(200, Math.ceil(sistolica) + 10), color: '#fca5a5', colorDark: '#7f1d1d' },
    ],
    ariaLabel: 'Escala de presión arterial sistólica según OMS/AHA',
  };

  const tone = categoria === 'Normal' ? 'good' : 'warn';
  const insightText = categoria === 'Normal'
    ? `Tu **${sistolica}/${diastolica} mmHg** entra en **Normal**: presión óptima y riesgo cardiovascular bajo. Sostené el estilo de vida y medí periódicamente.`
    : categoria === 'Crisis Hipertensiva'
      ? `**${sistolica}/${diastolica} mmHg** es una **crisis hipertensiva**. ${riesgo_descripcion} Buscá atención médica de inmediato.`
      : `Con **${sistolica}/${diastolica} mmHg** quedás en **${categoria}** según OMS/AHA 2026. ${riesgo_descripcion}`;

  return {
    categoria,
    clasificacion_numerica,
    riesgo_descripcion,
    recomendacion,
    _chart: chart,
    _insight: {
      title: categoria,
      text: insightText,
      tone,
      icon: '🩺',
    },
  };
}
