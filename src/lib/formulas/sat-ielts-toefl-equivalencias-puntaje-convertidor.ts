export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function satIeltsToeflEquivalenciasPuntajeConvertidor(i: Inputs): Outputs {
  const e=String(i.examen||'ielts'); const p=Number(i.puntaje)||0;
  let eq='', cefr='', interp='';
  if(e==='ielts'){
    if(p>=9){eq='TOEFL 118-120';cefr='C2';interp='Máximo nivel'}
    else if(p>=8){eq='TOEFL 110-114';cefr='C1+';interp='Muy alto'}
    else if(p>=7){eq='TOEFL 95-101';cefr='C1';interp='Avanzado'}
    else if(p>=6){eq='TOEFL 60-78';cefr='B2';interp='Intermedio alto — universitario'}
    else if(p>=5){eq='TOEFL 35-45';cefr='B1';interp='Intermedio'}
    else {eq='TOEFL <35';cefr='A2';interp='Básico'}
  } else {
    if(p>=115){eq='IELTS 8-9';cefr='C1-C2';interp='Muy alto'}
    else if(p>=95){eq='IELTS 7';cefr='C1';interp='Avanzado'}
    else if(p>=60){eq='IELTS 6';cefr='B2';interp='Intermedio alto'}
    else if(p>=35){eq='IELTS 5';cefr='B1';interp='Intermedio'}
    else {eq='IELTS <5';cefr='A2';interp='Básico'}
  }
  return { equivalenciaOtro:eq, cefr:cefr, interpretacion:interp };
}
