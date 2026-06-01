export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function ubaXxiNotaFinalPromedio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      aprobado: 'Aprobado',
      desaprobado: 'Desaprobado — recursar',
      buenaNota: 'Buena nota. Continuá así.',
      aprobadoObs: 'Aprobado.',
      recursar: 'Recursar o refuerzo.',
    },
    en: {
      aprobado: 'Passed',
      desaprobado: 'Failed — retake',
      buenaNota: 'Great grade. Keep it up.',
      aprobadoObs: 'Passed.',
      recursar: 'Retake or extra support.',
    },
  } as const)[__lang];
  const t=Number(i.promedioTrabajos)||0; const f=Number(i.notaFinal)||0;
  const prom=t*0.4+f*0.6;
  const reg=f>=4?T.aprobado:T.desaprobado;
  return { notaFinalMateria:prom.toFixed(1), regularidad:reg, observacion:prom>=7?T.buenaNota:prom>=4?T.aprobadoObs:T.recursar };
}
