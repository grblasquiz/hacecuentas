export interface Inputs { s1: string; s2: string; s3: string; s4: string; s5: string; }
export interface Outputs { nivel: string; puntaje: number; recomendaciones: string; _chart?: any; _insight?: any; }
export function nivelEstres(i: Inputs): Outputs {
  const vals = [i.s1,i.s2,i.s3,i.s4,i.s5].map(v=>Number(v)||0);
  const total = vals.reduce((a,b)=>a+b,0);
  let nivel='';let recs:string[]=[];
  if(total<=2){nivel='Bajo';recs=['Buen nivel. Seguí con tus hábitos actuales.','Mantené el ejercicio y el sueño como prioridades.'];}
  else if(total<=4){nivel='Moderado';recs=['El estrés se está acumulando. Incorporá pausas activas en tu día.','Probá 10 minutos de meditación o respiración profunda antes de dormir.'];}
  else if(total<=7){nivel='Moderado-Alto';recs=['Tu nivel de estrés es significativo. Priorizá el autocuidado.','Considerá hablar con un profesional de salud mental.','Ejercicio diario (aunque sean 20 min) puede hacer gran diferencia.','Revisá si podés delegar o reducir responsabilidades.'];}
  else{nivel='Alto';recs=['Tu nivel de estrés es alto. Es importante buscar ayuda profesional.','Consultá un psicólogo o llamá al 135 (Centro de Asistencia al Suicida, 24hs, gratuito).','Priorizá descanso, ejercicio y conexión social.','No estás solo/a — pedir ayuda es un acto de fortaleza.'];}
  const tone = total <= 2 ? 'good' : total <= 4 ? 'neutral' : 'warn';
  const insight = {
    title: `Nivel de estrés: ${nivel}`,
    text: `Tu puntaje de **${total}** ubica tu estrés en nivel **${nivel.toLowerCase()}**. ${total <= 2 ? 'Vas bien: mantené los hábitos que te sostienen.' : total <= 4 ? 'El estrés empieza a acumularse; sumá pausas y descanso antes de que escale.' : 'Es un nivel a atender: priorizá autocuidado y considerá apoyo profesional.'}`,
    tone,
    icon: total <= 2 ? '🙂' : total <= 4 ? '😐' : '😰',
  };
  const chart = {
    type: 'scale' as const,
    marker: total,
    markerLabel: String(total),
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 2, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Moderado', max: 4, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Moderado-alto', max: 7, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Alto', max: Math.max(10, total + 1), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Puntaje de estrés de ${total} ubicado en la zona ${nivel.toLowerCase()}`,
  };
  return { nivel, puntaje: total, recomendaciones: recs.join('\n'), _chart: chart, _insight: insight };
}
