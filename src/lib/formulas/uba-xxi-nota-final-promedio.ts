export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | object; }
export function ubaXxiNotaFinalPromedio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      aprobado: 'Aprobado',
      desaprobado: 'Desaprobado — recursar',
      buenaNota: 'Buena nota. Continuá así.',
      aprobadoObs: 'Aprobado.',
      recursar: 'Recursar o refuerzo.',
      insTitle: 'Tu nota final',
      insGood: (p: string) => `Cerrás la materia con un **${p}**: aprobado con buena nota. El final pesa 60% y los trabajos 40%.`,
      insOk: (p: string) => `Tu nota final es **${p}**: materia aprobada. Recordá que el final vale 60% y los trabajos 40% del promedio.`,
      insBad: (p: string, f: string) => `Tu nota final da **${p}** y el final fue **${f}** (menor a 4): la materia queda **desaprobada** y hay que recursar.`,
      segDesap: 'Desaprobado',
      segAprob: 'Aprobado',
      segBueno: 'Muy bueno',
      ariaLabel: (p: string) => `Tu nota final ${p} sobre una escala de 0 a 10`,
    },
    en: {
      aprobado: 'Passed',
      desaprobado: 'Failed — retake',
      buenaNota: 'Great grade. Keep it up.',
      aprobadoObs: 'Passed.',
      recursar: 'Retake or extra support.',
      insTitle: 'Your final grade',
      insGood: (p: string) => `You close the course with a **${p}**: passed with a strong grade. The final exam weighs 60% and coursework 40%.`,
      insOk: (p: string) => `Your final grade is **${p}**: course passed. Remember the final exam is 60% and coursework 40% of the average.`,
      insBad: (p: string, f: string) => `Your final grade is **${p}** and the exam was **${f}** (below 4): the course is **failed** and must be retaken.`,
      segDesap: 'Failed',
      segAprob: 'Passed',
      segBueno: 'Very good',
      ariaLabel: (p: string) => `Your final grade ${p} on a 0 to 10 scale`,
    },
  } as const)[__lang];
  const t=Number(i.promedioTrabajos)||0; const f=Number(i.notaFinal)||0;
  const prom=t*0.4+f*0.6;
  const reg=f>=4?T.aprobado:T.desaprobado;
  const promStr = prom.toFixed(1);
  const aprobadoFinal = f >= 4;
  const tone = !aprobadoFinal ? 'warn' : prom >= 7 ? 'good' : 'neutral';
  const insText = !aprobadoFinal
    ? T.insBad(promStr, f.toFixed(1))
    : prom >= 7
    ? T.insGood(promStr)
    : T.insOk(promStr);
  const _insight = { title: T.insTitle, text: insText, tone, icon: '🎓' };
  const _chart = {
    type: 'scale',
    marker: Number(promStr),
    markerLabel: promStr,
    min: 0,
    segments: [
      { nombre: T.segDesap, max: 4, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: T.segAprob, max: 7, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: T.segBueno, max: 10.01, color: '#22c55e', colorDark: '#16a34a' },
    ],
    ariaLabel: T.ariaLabel(promStr),
  };
  return { notaFinalMateria:promStr, regularidad:reg, observacion:prom>=7?T.buenaNota:prom>=4?T.aprobadoObs:T.recursar, _insight, _chart };
}
