export interface Inputs { s1: string; s2: string; s3: string; s4: string; s5: string; }
export interface Outputs { nivel: string; puntaje: number; recomendaciones: string; }
export function nivelEstres(i: Inputs): Outputs {
  const vals = [i.s1,i.s2,i.s3,i.s4,i.s5].map(v=>Number(v)||0);
  const total = vals.reduce((a,b)=>a+b,0);
  let nivel='';let recs:string[]=[];
  if(total<=2){nivel='Bajo';recs=['Buen nivel. Seguí con tus hábitos actuales.','Mantené el ejercicio y el sueño como prioridades.'];}
  else if(total<=4){nivel='Moderado';recs=['El estrés se está acumulando. Incorporá pausas activas en tu día.','Probá 10 minutos de meditación o respiración profunda antes de dormir.'];}
  else if(total<=7){nivel='Moderado-Alto';recs=['Tu nivel de estrés es significativo. Priorizá el autocuidado.','Considerá hablar con un profesional de salud mental.','Ejercicio diario (aunque sean 20 min) puede hacer gran diferencia.','Revisá si podés delegar o reducir responsabilidades.'];}
  else{nivel='Alto';recs=['Tu nivel de estrés es alto. Es importante buscar ayuda profesional.','Consultá un psicólogo o llamá al 135 (Centro de Asistencia al Suicida, 24hs, gratuito).','Priorizá descanso, ejercicio y conexión social.','No estás solo/a — pedir ayuda es un acto de fortaleza.'];}
  return { nivel, puntaje: total, recomendaciones: recs.join('\n') };
}
