export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function porcentajeDeNumeroCalculadora(i: Inputs): Outputs {
  const modo=String(i.modo||'deN'); const x=Number(i.x)||0; const n=Number(i.n)||0;
  if (modo==='deN') return { resultado:(n*x/100).toFixed(2), resumen:`${x}% de ${n} = ${(n*x/100).toFixed(2)}.` };
  if (n===0) return { resultado:'—', resumen:'B no puede ser 0.' };
  return { resultado:`${(x/n*100).toFixed(2)} %`, resumen:`${x} es ${(x/n*100).toFixed(2)}% de ${n}.` };
}
