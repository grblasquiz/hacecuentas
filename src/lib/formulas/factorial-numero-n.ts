export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function factorialNumeroN(i: Inputs): Outputs {
  const n=Number(i.n)||0;
  if (n<0) return { resultado:'—', resumen:'Factorial no definido para negativos.' };
  if (n>170) return { resultado:'∞', resumen:'Desborda (overflow).' };
  let f=1; for (let k=2;k<=n;k++) f*=k;
  return { resultado:f.toLocaleString(), resumen:`${n}! = ${f.toLocaleString()}.` };
}
