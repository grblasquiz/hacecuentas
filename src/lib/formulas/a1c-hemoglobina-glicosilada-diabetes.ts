export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function a1cHemoglobinaGlicosiladaDiabetes(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      normal: 'Normal',
      prediabetes: 'Prediabetes',
      diabetes: 'Diabetes',
      diabetesMalControlada: 'Diabetes mal controlada',
      bajo: 'Bajo',
      medio: 'Medio',
      alto: 'Alto',
      muyAlto: 'Muy alto',
    },
    en: {
      normal: 'Normal',
      prediabetes: 'Prediabetes',
      diabetes: 'Diabetes',
      diabetesMalControlada: 'Poorly controlled diabetes',
      bajo: 'Low',
      medio: 'Medium',
      alto: 'High',
      muyAlto: 'Very high',
    },
  } as const)[__lang];
  const h=Number(i.hba1c)||0; const g=28.7*h-46.7;
  let clas='', riesgo='';
  if(h<5.7){clas=T.normal;riesgo=T.bajo}
  else if(h<6.5){clas=T.prediabetes;riesgo=T.medio}
  else if(h<8){clas=T.diabetes;riesgo=T.alto}
  else {clas=T.diabetesMalControlada;riesgo=T.muyAlto}
  return { glucosaPromedio:`${Math.round(g)} mg/dL`, clasificacion:clas, riesgo:riesgo };
}
