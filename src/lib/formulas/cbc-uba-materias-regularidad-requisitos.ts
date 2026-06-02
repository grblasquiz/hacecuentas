export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function cbcUbaMateriasRegularidadRequisitos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      libreAsistencia: 'Libre por asistencia',
      libreParciales: 'Libre por parciales (recuperatorio disponible)',
      regular: 'Regular — rinde final',
      obsContinua: 'Continuá con final oral/escrito.',
      obsRevisa: 'Revisá tu caso con docente.',
      insTitle: 'Tu condición',
      insRegular: `Quedaste **regular** con asistencia de **{a}%** y promedio **{prom}**. El paso que falta es rendir el final.`,
      insAsist: `Quedaste **libre por asistencia**: con **{a}%** no llegás al mínimo de **75%**. Las notas no alcanzan a recuperarlo.`,
      insParc: `Quedaste **libre por parciales**: un parcial debajo de **4** (sacaste {p1} y {p2}). Te queda el **recuperatorio** para recomponer.`,
      gMarker: 'Promedio',
      gFail: 'Desaprobado',
      gReg: 'Regular',
      gGood: 'Muy bueno',
      gAria: 'Promedio de parciales en escala 0 a 10',
    },
    en: {
      libreAsistencia: 'Absent — failed attendance',
      libreParciales: 'Absent — failed midterms (make-up available)',
      regular: 'Regular — must take final exam',
      obsContinua: 'Keep going and prepare for the final.',
      obsRevisa: 'Review your situation with your professor.',
      insTitle: 'Your status',
      insRegular: `You are **regular** with **{a}%** attendance and a **{prom}** average. All that is left is to sit the final exam.`,
      insAsist: `You **failed attendance**: **{a}%** is below the **75%** minimum. Grades cannot make up for it.`,
      insParc: `You **failed midterms**: one midterm below **4** (you scored {p1} and {p2}). A **make-up exam** is still available.`,
      gMarker: 'Average',
      gFail: 'Failed',
      gReg: 'Regular',
      gGood: 'Very good',
      gAria: 'Midterm average on a 0 to 10 scale',
    },
    pt: {
      libreAsistencia: 'Livre por falta de presença',
      libreParciales: 'Livre por notas nas provas (recuperação disponível)',
      regular: 'Regular — deve fazer prova final',
      obsContinua: 'Continue se preparando para a prova final.',
      obsRevisa: 'Revise sua situação com o professor.',
      insTitle: 'Sua condição',
      insRegular: `Você ficou **regular** com **{a}%** de presença e média **{prom}**. Só falta fazer a prova final.`,
      insAsist: `Você ficou **livre por falta**: **{a}%** está abaixo do mínimo de **75%**. As notas não recuperam isso.`,
      insParc: `Você ficou **livre pelas provas**: uma prova abaixo de **4** (tirou {p1} e {p2}). Ainda há a **recuperação** disponível.`,
      gMarker: 'Média',
      gFail: 'Reprovado',
      gReg: 'Regular',
      gGood: 'Muito bom',
      gAria: 'Média das provas em escala de 0 a 10',
    },
  } as const)[__lang];
  const a=Number(i.asistenciaPorcentaje)||0; const p1=Number(i.parcial1)||0; const p2=Number(i.parcial2)||0;
  let reg='';
  let isRegular=false;
  let modo: 'regular'|'asist'|'parc' = 'regular';
  if(a<75) { reg=T.libreAsistencia; modo='asist'; }
  else if(p1<4||p2<4) { reg=T.libreParciales; modo='parc'; }
  else { reg=T.regular; isRegular=true; modo='regular'; }
  const prom=(p1+p2)/2;
  const promFmt=prom.toFixed(1);
  const fill=(s:string)=>s.replace('{a}',String(a)).replace('{prom}',promFmt).replace('{p1}',String(p1)).replace('{p2}',String(p2));
  const _insight = {
    title: T.insTitle,
    text: fill(modo==='regular'?T.insRegular:modo==='asist'?T.insAsist:T.insParc),
    tone: isRegular ? 'good' : 'warn',
    icon: isRegular ? '🎓' : '⚠️',
  };
  const _chart = {
    type: 'scale',
    marker: Number(promFmt),
    markerLabel: T.gMarker,
    min: 0,
    segments: [
      { nombre: T.gFail, max: 4, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: T.gReg, max: 7, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: T.gGood, max: 10, color: '#22c55e', colorDark: '#16a34a' },
    ],
    ariaLabel: T.gAria,
  };
  return { regularidad:reg, promedio:promFmt, observacion:isRegular?T.obsContinua:T.obsRevisa, _insight, _chart };
}
