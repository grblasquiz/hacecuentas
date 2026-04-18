export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function horasCaligrafiaChinoKanjiPractica(i: Inputs): Outputs {
  const c=Number(i.caracteres)||0; const m=Number(i.minDia)||0;
  const h=c*0.3;
  const meses=m===0?'—':h*60/(m*30);
  return { horas:`${h.toFixed(0)}h`, meses:typeof meses==='string'?meses:`${Number(meses).toFixed(1)} meses`, resumen:`${c} chars: ${h.toFixed(0)}h, ${typeof meses==='string'?meses:`${Number(meses).toFixed(0)} meses`} a ${m}min/día.` };
}
