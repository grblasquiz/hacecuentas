export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionGradosRadianesGradianes(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const de=String(i.desde||'deg'); const a=String(i.a||'rad');
  let deg:number;
  if (de==='deg') deg=v; else if (de==='rad') deg=v*180/Math.PI; else deg=v*0.9;
  let res:number;
  if (a==='deg') res=deg; else if (a==='rad') res=deg*Math.PI/180; else res=deg/0.9;
  return { resultado:`${res.toFixed(4)} ${a}`, resumen:`${v} ${de} = ${res.toFixed(4)} ${a}.` };
}
