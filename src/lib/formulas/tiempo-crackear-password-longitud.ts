export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoCrackearPasswordLongitud(i: Inputs): Outputs {
  const l=Math.floor(Number(i.largo)||0); const cs=String(i.charset||'min');
  const sz:Record<string,number>={num:10,min:26,alnum:62,todo:95};
  const n=sz[cs]||26;
  const total=Math.pow(n,l);
  const seg=total/1e9;
  let txt:string;
  if (seg<60) txt=`${seg.toFixed(1)} seg`;
  else if (seg<3600) txt=`${(seg/60).toFixed(1)} min`;
  else if (seg<86400) txt=`${(seg/3600).toFixed(1)} horas`;
  else if (seg<86400*365) txt=`${(seg/86400).toFixed(1)} días`;
  else txt=`${(seg/(86400*365)).toExponential(2)} años`;
  return { intentos:total.toExponential(2), tiempo:txt, resumen:`Password largo ${l} charset ${cs}: ${txt} a 1B/s.` };
}
