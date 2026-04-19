export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function caloriasEmbarazoExtraTrimestre(i: Inputs): Outputs {
  const t=String(i.trimestre||'1'); const b=Number(i.caloriasBase)||2000;
  const extra: Record<string,number> = { '1':0, '2':340, '3':450, lact:500 };
  const e=extra[t]||0;
  return { extra:`+${e} kcal`, total:(b+e)+' kcal', resumen:`${t} trimestre: +${e} kcal = ${b+e} kcal/día total.` };
}
