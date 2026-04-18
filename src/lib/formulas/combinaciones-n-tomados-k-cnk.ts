export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function combinacionesNTomadosKCnk(i: Inputs): Outputs {
  const n=Math.floor(Number(i.n)||0); const k=Math.floor(Number(i.k)||0);
  if (k<0||k>n) return { resultado:'0', resumen:'k fuera de rango [0,n].' };
  let c=1; const m=Math.min(k,n-k);
  for (let j=0;j<m;j++) c=c*(n-j)/(j+1);
  return { resultado:Math.round(c).toLocaleString(), resumen:`C(${n},${k}) = ${Math.round(c).toLocaleString()}.` };
}
