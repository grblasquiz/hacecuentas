export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function satIeltsToeflEquivalenciasPuntajeConvertidor(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      maxLevel:   'Máximo nivel',
      veryHigh:   'Muy alto',
      advanced:   'Avanzado',
      upperIntUniv: 'Intermedio alto — universitario',
      upperInt:   'Intermedio alto',
      intermediate: 'Intermedio',
      basic:      'Básico',
    },
    en: {
      maxLevel:   'Maximum level',
      veryHigh:   'Very high',
      advanced:   'Advanced',
      upperIntUniv: 'Upper intermediate — university level',
      upperInt:   'Upper intermediate',
      intermediate: 'Intermediate',
      basic:      'Basic',
    },
  } as const)[__lang];
  const e=String(i.examen||'ielts'); const p=Number(i.puntaje)||0;
  let eq='', cefr='', interp='';
  if(e==='ielts'){
    if(p>=9){eq='TOEFL 118-120';cefr='C2';interp=T.maxLevel}
    else if(p>=8){eq='TOEFL 110-114';cefr='C1+';interp=T.veryHigh}
    else if(p>=7){eq='TOEFL 95-101';cefr='C1';interp=T.advanced}
    else if(p>=6){eq='TOEFL 60-78';cefr='B2';interp=T.upperIntUniv}
    else if(p>=5){eq='TOEFL 35-45';cefr='B1';interp=T.intermediate}
    else {eq='TOEFL <35';cefr='A2';interp=T.basic}
  } else {
    if(p>=115){eq='IELTS 8-9';cefr='C1-C2';interp=T.veryHigh}
    else if(p>=95){eq='IELTS 7';cefr='C1';interp=T.advanced}
    else if(p>=60){eq='IELTS 6';cefr='B2';interp=T.upperInt}
    else if(p>=35){eq='IELTS 5';cefr='B1';interp=T.intermediate}
    else {eq='IELTS <5';cefr='A2';interp=T.basic}
  }
  return { equivalenciaOtro:eq, cefr:cefr, interpretacion:interp };
}
