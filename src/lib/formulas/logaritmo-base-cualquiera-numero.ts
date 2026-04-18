export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function logaritmoBaseCualquieraNumero(i: Inputs): Outputs {
  const x=Number(i.x)||0; const b=Number(i.b)||10;
  if (x<=0||b<=0||b===1) return { log:'—', resumen:'Dominio inválido: x>0 y b>0, b≠1.' };
  const l=Math.log(x)/Math.log(b);
  return { log:l.toFixed(4), resumen:`log base ${b} de ${x} = ${l.toFixed(3)}.` };
}
