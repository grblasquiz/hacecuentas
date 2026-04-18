export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionBaseDecimalBinarioHexa(i: Inputs): Outputs {
  const n=String(i.n||'0'); const desde=Number(i.desde)||10; const a=Number(i.a)||10;
  let dec:number;
  try { dec=parseInt(n, desde); } catch { return { resultado:'—', resumen:'Número inválido.' }; }
  if (isNaN(dec)) return { resultado:'—', resumen:'Número inválido para la base dada.' };
  const res=dec.toString(a).toUpperCase();
  return { resultado:res, resumen:`${n} base ${desde} = ${res} base ${a} (= ${dec} dec).` };
}
