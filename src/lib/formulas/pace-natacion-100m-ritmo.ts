export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function paceNatacion100mRitmo(i: Inputs): Outputs {
  const d=Number(i.distanciaM)||0; const t=Number(i.tiempoMinutos)||0;
  const paceSegPor100=d>0?(t*60/d*100):0;
  const min=Math.floor(paceSegPor100/60); const seg=Math.round(paceSegPor100%60);
  const v=d/(t*60);
  let clas='';
  if(paceSegPor100<65) clas='Elite';
  else if(paceSegPor100<90) clas='Avanzado';
  else if(paceSegPor100<120) clas='Intermedio';
  else clas='Principiante';
  return { pace:`${min}:${String(seg).padStart(2,'0')}/100m`, velocidadMs:`${v.toFixed(2)} m/s`, clasificacion:clas };
}
