export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function fshLhMenopausiaPerimenopausiaEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      etapa1: 'Menopausia establecida',
      interp1: 'FSH elevada sostenida',
      rec1: 'Terapia síntomas si aplican',
      etapa2: 'Perimenopausia',
      interp2: 'Transición hormonal',
      rec2: 'Control ginecológico, evaluar síntomas',
      etapa3: 'Pre-menopausia normal',
      interp3: 'Función ovárica normal',
      rec3: 'Controles de rutina',
      etapa4: 'Variable',
      interp4: 'Interpretación según contexto clínico',
      rec4: 'Consultar ginecólogo',
    },
    en: {
      etapa1: 'Established menopause',
      interp1: 'Sustained elevated FSH',
      rec1: 'Symptom therapy if applicable',
      etapa2: 'Perimenopause',
      interp2: 'Hormonal transition',
      rec2: 'Gynecological follow-up, evaluate symptoms',
      etapa3: 'Normal pre-menopause',
      interp3: 'Normal ovarian function',
      rec3: 'Routine check-ups',
      etapa4: 'Variable',
      interp4: 'Interpretation based on clinical context',
      rec4: 'Consult a gynecologist',
    },
  } as const)[__lang];
  const f=Number(i.fsh)||0; const l=Number(i.lh)||0; const e=Number(i.edad)||0;
  let etapa='', interp='', rec='';
  if(f>=30&&e>=45){etapa=T.etapa1;interp=T.interp1;rec=T.rec1}
  else if(f>=15&&f<30){etapa=T.etapa2;interp=T.interp2;rec=T.rec2}
  else if(f<10){etapa=T.etapa3;interp=T.interp3;rec=T.rec3}
  else {etapa=T.etapa4;interp=T.interp4;rec=T.rec4}
  return { etapa:etapa, interpretacion:interp, recomendacion:rec };
}
