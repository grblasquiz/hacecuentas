export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function presionArterialClasificacionOms(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      optima: 'Óptima',
      normal: 'Normal',
      normalAlta: 'Normal alta',
      hta1: 'Hipertensión grado 1',
      hta2: 'Hipertensión grado 2',
      hta3: 'Hipertensión grado 3 / Crisis',
      crisis: 'Crisis hipertensiva',
      rBajo: 'Bajo',
      rNormal: 'Normal',
      rMedio: 'Moderado',
      rAlto: 'Alto',
      rMuyAlto: 'Muy alto',
      rEmergencia: 'EMERGENCIA',
      recOptima: 'Control cada 5 años',
      recNormal: 'Control cada 3 años',
      recNormalAlta: 'Cambios de estilo de vida + control anual',
      recHta1: 'Tratamiento + cambios de estilo de vida',
      recHta2: 'Tratamiento farmacológico inmediato',
      recHta3: 'Tratamiento urgente',
      recCrisis: 'Consulta urgente en guardia',
      insTitle: 'Qué dice tu presión',
      insSys: 'Tu sistólica',
      markerLbl: 'Tu sistólica',
      ariaLbl: 'Escala de presión arterial sistólica según OMS/ISH 2020',
      segOptima: 'Óptima',
      segNormal: 'Normal',
      segNormAlta: 'N. Alta',
      segHta1: 'HTA 1',
      segHta2: 'HTA 2',
      segCrisis: 'Crisis',
    },
    en: {
      optima: 'Optimal',
      normal: 'Normal',
      normalAlta: 'High-normal',
      hta1: 'Hypertension grade 1',
      hta2: 'Hypertension grade 2',
      hta3: 'Hypertension grade 3 / Crisis',
      crisis: 'Hypertensive crisis',
      rBajo: 'Low',
      rNormal: 'Normal',
      rMedio: 'Moderate',
      rAlto: 'High',
      rMuyAlto: 'Very high',
      rEmergencia: 'EMERGENCY',
      recOptima: 'Check every 5 years',
      recNormal: 'Check every 3 years',
      recNormalAlta: 'Lifestyle changes + annual check',
      recHta1: 'Treatment + lifestyle changes',
      recHta2: 'Immediate drug treatment',
      recHta3: 'Urgent treatment',
      recCrisis: 'Seek urgent medical care',
      insTitle: 'What your reading means',
      insSys: 'Your systolic',
      markerLbl: 'Your systolic',
      ariaLbl: 'Systolic blood pressure scale per WHO/ISH 2020',
      segOptima: 'Optimal',
      segNormal: 'Normal',
      segNormAlta: 'High-N.',
      segHta1: 'Stage 1',
      segHta2: 'Stage 2',
      segCrisis: 'Crisis',
    },
  } as const)[__lang];

  const s = Number(i.sistolica) || 0;
  const d = Number(i.diastolica) || 0;

  // WHO/ISH 2020 classification (https://www.who.int/publications/i/item/9789240012110)
  // If systolic and diastolic fall in different categories, the HIGHER category prevails.
  let clas = '', riesgo = '', rec = '', tone: 'good' | 'warn' | 'neutral' = 'neutral', icon = '🩺';

  if (s >= 180 || d >= 120) {
    clas = T.crisis; riesgo = T.rEmergencia; rec = T.recCrisis; tone = 'warn'; icon = '🚨';
  } else if (s >= 160 || d >= 100) {
    clas = T.hta2; riesgo = T.rMuyAlto; rec = T.recHta2; tone = 'warn'; icon = '⚠️';
  } else if (s >= 140 || d >= 90) {
    clas = T.hta1; riesgo = T.rAlto; rec = T.recHta1; tone = 'warn'; icon = '⚠️';
  } else if (s >= 130 || d >= 85) {
    clas = T.normalAlta; riesgo = T.rMedio; rec = T.recNormalAlta; tone = 'neutral'; icon = '🩺';
  } else if (s >= 120 || d >= 80) {
    clas = T.normal; riesgo = T.rNormal; rec = T.recNormal; tone = 'neutral'; icon = '🩺';
  } else {
    clas = T.optima; riesgo = T.rBajo; rec = T.recOptima; tone = 'good'; icon = '💚';
  }

  const _insight = {
    title: T.insTitle,
    text: __lang === 'en'
      ? `A reading of **${s}/${d} mmHg** classifies as **${clas}** (${riesgo} risk). ${rec}.`
      : `Una medición de **${s}/${d} mmHg** se clasifica como **${clas}** (riesgo ${riesgo.toLowerCase()}). ${rec}.`,
    tone,
    icon,
  };

  const _chart = {
    type: 'scale' as const,
    marker: s,
    markerLabel: `${T.markerLbl}: ${s} mmHg`,
    min: 90,
    unit: ' mmHg',
    segments: [
      { nombre: T.segOptima, max: 120, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: T.segNormal, max: 130, color: '#d1fae5', colorDark: '#065f46' },
      { nombre: T.segNormAlta, max: 140, color: '#fde68a', colorDark: '#b45309' },
      { nombre: T.segHta1, max: 160, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: T.segHta2, max: 180, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: T.segCrisis, max: Math.max(210, Math.ceil(s) + 10), color: '#fca5a5', colorDark: '#7f1d1d' },
    ],
    ariaLabel: T.ariaLbl,
  };

  return { clasificacion: clas, riesgo: riesgo, recomendacion: rec, _insight, _chart };
}
