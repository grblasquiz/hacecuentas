/** ¿Tu presión arterial es normal? */
export interface Inputs {
  sistolica: number;
  diastolica: number;
}
export interface Outputs {
  clasificacion: string;
  riesgo: string;
  recomendacion: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function presionArterialRango(i: Inputs): Outputs {
  const sis = Number(i.sistolica);
  const dia = Number(i.diastolica);
  if (!sis || sis < 60 || sis > 300) throw new Error('Ingresá la presión sistólica (número mayor)');
  if (!dia || dia < 30 || dia > 200) throw new Error('Ingresá la presión diastólica (número menor)');

  // Clasificación AHA/ACC 2017
  let clasificacion: string;
  let riesgo: string;
  let recomendacion: string;

  if (sis < 90 || dia < 60) {
    clasificacion = 'Hipotensión';
    riesgo = 'Puede causar mareos, desmayos';
    recomendacion = 'Consultá al médico si tenés síntomas (mareos, visión borrosa, fatiga).';
  } else if (sis < 120 && dia < 80) {
    clasificacion = 'Normal';
    riesgo = 'Bajo';
    recomendacion = 'Excelente. Mantené hábitos saludables y controlate una vez al año.';
  } else if (sis < 130 && dia < 80) {
    clasificacion = 'Elevada';
    riesgo = 'Moderado';
    recomendacion = 'Reducí sal, hacé ejercicio regular, bajá de peso si tenés exceso. Controlate cada 6 meses.';
  } else if (sis < 140 || dia < 90) {
    clasificacion = 'Hipertensión Grado 1';
    riesgo = 'Alto';
    recomendacion = 'Consultá al médico. Cambios de estilo de vida + posiblemente medicación.';
  } else if (sis < 180 || dia < 120) {
    clasificacion = 'Hipertensión Grado 2';
    riesgo = 'Muy alto';
    recomendacion = 'Necesitás tratamiento médico. Consultá lo antes posible.';
  } else {
    clasificacion = 'Crisis hipertensiva';
    riesgo = 'Emergencia';
    recomendacion = 'Llamá a emergencias o andá a la guardia inmediatamente.';
  }

  // Tono dinámico según la clasificación
  const tone = clasificacion === 'Normal' ? 'good' : 'warn';
  const insightText = clasificacion === 'Normal'
    ? `Tu **${sis}/${dia} mmHg** está en rango **Normal**: riesgo cardiovascular bajo. Mantené hábitos y controlate una vez al año.`
    : clasificacion === 'Crisis hipertensiva'
      ? `**${sis}/${dia} mmHg** es una **crisis hipertensiva**. ${recomendacion}`
      : `Con **${sis}/${dia} mmHg** caés en **${clasificacion}** (riesgo ${riesgo.toLowerCase()}). ${recomendacion}`;

  return {
    clasificacion,
    riesgo,
    recomendacion,
    mensaje: `${sis}/${dia} mmHg → ${clasificacion}. Riesgo: ${riesgo}. ${recomendacion}`,
    _insight: {
      title: clasificacion,
      text: insightText,
      tone,
      icon: '🩺',
    },
    _chart: {
      type: 'scale' as const,
      marker: sis,
      markerLabel: `Tu sistólica: ${sis} mmHg`,
      min: 70,
      unit: ' mmHg',
      segments: [
        { nombre: 'Hipotensión', max: 90, color: '#bfdbfe', colorDark: '#1e40af' },
        { nombre: 'Normal', max: 120, color: '#bbf7d0', colorDark: '#166534' },
        { nombre: 'Elevada', max: 130, color: '#fde68a', colorDark: '#b45309' },
        { nombre: 'HTA Grado 1', max: 140, color: '#fed7aa', colorDark: '#9a3412' },
        { nombre: 'HTA Grado 2', max: 180, color: '#fecaca', colorDark: '#b91c1c' },
        { nombre: 'Crisis', max: Math.max(200, Math.ceil(sis) + 10), color: '#fca5a5', colorDark: '#7f1d1d' },
      ],
      ariaLabel: 'Escala de presión arterial sistólica según AHA/ACC',
    },
  };
}
