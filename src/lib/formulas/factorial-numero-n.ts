export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | Record<string, any>; }
export function factorialNumeroN(i: Inputs): Outputs {
  const n=Number(i.n)||0;
  if (n<0) return {
    resultado:'—',
    resumen:'Factorial no definido para negativos.',
    _insight:{ title:'Sin resultado', text:'El factorial solo está definido para enteros **≥ 0**. Ingresá un número natural para obtener el cálculo.', tone:'warn', icon:'🔢' },
  };
  if (n>170) return {
    resultado:'∞',
    resumen:'Desborda (overflow).',
    _insight:{ title:'Número demasiado grande', text:`**${n}!** supera el máximo representable (170! ≈ 7,26×10³⁰⁶). El resultado se desborda a infinito.`, tone:'warn', icon:'🔢' },
  };
  let f=1; for (let k=2;k<=n;k++) f*=k;
  return {
    resultado:f.toLocaleString(),
    resumen:`${n}! = ${f.toLocaleString()}.`,
    _insight:{ title:'Qué significa', text:`**${n}!** = ${f.toLocaleString()}: la cantidad de formas distintas de ordenar **${n}** elementos en fila.`, tone:'neutral', icon:'🔢' },
  };
}
