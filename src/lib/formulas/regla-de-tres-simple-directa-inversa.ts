export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function reglaDeTresSimpleDirectaInversa(i: Inputs): Outputs {
  const modo=String(i.modo||'dir'); const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0;
  if (a===0) return { x:'—', resumen:'División por cero.' };
  const x=modo==='dir'?(b*c/a):(a*b/c);
  return { x:x.toFixed(2), resumen:`Resultado: ${x.toFixed(2)}.` };
}
