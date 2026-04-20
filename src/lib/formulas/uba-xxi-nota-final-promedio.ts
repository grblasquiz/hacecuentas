export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ubaXxiNotaFinalPromedio(i: Inputs): Outputs {
  const t=Number(i.promedioTrabajos)||0; const f=Number(i.notaFinal)||0;
  const prom=t*0.4+f*0.6;
  const reg=f>=4?'Aprobado':'Desaprobado — recursar';
  return { notaFinalMateria:prom.toFixed(1), regularidad:reg, observacion:prom>=7?'Buena nota. Continuá así.':prom>=4?'Aprobado.':'Recursar o refuerzo.' };
}
