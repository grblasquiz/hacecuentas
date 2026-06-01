export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
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
    },
  } as const)[__lang];
  const s=Number(i.sistolica)||0; const d=Number(i.diastolica)||0;
  let clas='', riesgo='', rec='';
  if(s>=180||d>=120){clas=T.crisis;riesgo=T.emergencia;rec=T.consultaUrgente}
  else if(s>=140||d>=90){clas=T.hta2;riesgo=T.alto;rec=T.farmaco}
  else if(s>=130||d>=80){clas=T.hta1;riesgo=T.medioAlto;rec=T.estiloSeguimiento}
  else if(s>=120){clas=T.elevada;riesgo=T.medio;rec=T.dieta}
  else {clas=T.normal;riesgo=T.bajo;rec=T.habitos}
  return { clasificacion:clas, riesgo:riesgo, recomendacion:rec };
}
