export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function mcdMcmDosNumerosEnteros(i: Inputs): Outputs {
  let a=Math.abs(Math.floor(Number(i.a)||0)); let b=Math.abs(Math.floor(Number(i.b)||0));
  if (a===0||b===0) return { mcd:'—', mcm:'—', resumen:'Números deben ser enteros no nulos.' };
  const A=a, B=b; while (b) { [a,b]=[b,a%b]; }
  const mcm=(A*B)/a;
  return { mcd:a.toString(), mcm:mcm.toLocaleString(), resumen:`MCD(${A},${B})=${a}, MCM=${mcm}.` };
}
