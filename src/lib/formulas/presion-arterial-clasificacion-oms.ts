export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function presionArterialClasificacionOms(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      crisis: 'Crisis hipertensiva',
      emergencia: 'EMERGENCIA',
      consultaUrgente: 'Consulta urgente',
      hta2: 'Hipertensión estadio 2',
      alto: 'Alto',
      farmaco: 'Tratamiento farmacológico probable',
      hta1: 'Hipertensión estadio 1',
      medioAlto: 'Medio-Alto',
      estiloSeguimiento: 'Cambios de estilo + seguimiento',
      elevada: 'Presión elevada',
      medio: 'Medio',
      dieta: 'Dieta, ejercicio, reducir sodio',
      normal: 'Normal',
      bajo: 'Bajo',
      habitos: 'Mantener hábitos saludables',
      insTitle: 'Qué dice tu presión',
      insSys: 'Tu sistólica',
      markerLbl: 'Tu sistólica',
      ariaLbl: 'Escala de presión arterial sistólica según OMS',
      segNormal: 'Normal',
      segElevada: 'Elevada',
      segHta1: 'HTA 1',
      segHta2: 'HTA 2',
      segCrisis: 'Crisis',
    },
    en: {
      crisis: 'Hypertensive crisis',
      emergencia: 'EMERGENCY',
      consultaUrgente: 'Seek urgent medical care',
      hta2: 'Hypertension stage 2',
      alto: 'High',
      farmaco: 'Drug treatment likely needed',
      hta1: 'Hypertension stage 1',
      medioAlto: 'Medium-High',
      estiloSeguimiento: 'Lifestyle changes + monitoring',
      elevada: 'Elevated blood pressure',
      medio: 'Medium',
      dieta: 'Diet, exercise, reduce sodium',
      normal: 'Normal',
      bajo: 'Low',
      habitos: 'Maintain healthy habits',
      insTitle: 'What your reading means',
      insSys: 'Your systolic',
      markerLbl: 'Your systolic',
      ariaLbl: 'Systolic blood pressure scale per WHO',
      segNormal: 'Normal',
      segElevada: 'Elevated',
      segHta1: 'Stage 1',
      segHta2: 'Stage 2',
      segCrisis: 'Crisis',
    },
  } as const)[__lang];
  const s=Number(i.sistolica)||0; const d=Number(i.diastolica)||0;
  let clas='', riesgo='', rec='', tone: 'good'|'warn'|'neutral' = 'neutral', icon = '🩺';
  if(s>=180||d>=120){clas=T.crisis;riesgo=T.emergencia;rec=T.consultaUrgente;tone='warn';icon='🚨'}
  else if(s>=140||d>=90){clas=T.hta2;riesgo=T.alto;rec=T.farmaco;tone='warn';icon='⚠️'}
  else if(s>=130||d>=80){clas=T.hta1;riesgo=T.medioAlto;rec=T.estiloSeguimiento;tone='warn';icon='🩺'}
  else if(s>=120){clas=T.elevada;riesgo=T.medio;rec=T.dieta;tone='neutral';icon='🩺'}
  else {clas=T.normal;riesgo=T.bajo;rec=T.habitos;tone='good';icon='💚'}

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
      { nombre: T.segNormal, max: 120, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: T.segElevada, max: 130, color: '#fde68a', colorDark: '#b45309' },
      { nombre: T.segHta1, max: 140, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: T.segHta2, max: 180, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: T.segCrisis, max: Math.max(200, Math.ceil(s) + 10), color: '#fca5a5', colorDark: '#7f1d1d' },
    ],
    ariaLabel: T.ariaLbl,
  };

  return { clasificacion:clas, riesgo:riesgo, recomendacion:rec, _insight, _chart };
}
