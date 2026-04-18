export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function permutacionesNTomadosKPnk(i: Inputs): Outputs {
  const n=Math.floor(Number(i.n)||0); const k=Math.floor(Number(i.k)||0);
  if (k<0||k>n) return { resultado:'0', resumen:'k fuera de rango.' };
  let p=1; for (let j=0;j<k;j++) p*=(n-j);
  return { resultado:p.toLocaleString(), resumen:`P(${n},${k}) = ${p.toLocaleString()}.` };
}
