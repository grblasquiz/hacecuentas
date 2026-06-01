export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function mcdMcmDosNumerosEnteros(i: Inputs): Outputs {
  const __lang = i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { error: 'Números deben ser enteros no nulos.' },
    pt: { error: 'Os números devem ser inteiros não nulos.' },
  } as const)[__lang];
  let a=Math.abs(Math.floor(Number(i.a)||0)); let b=Math.abs(Math.floor(Number(i.b)||0));
  if (a===0||b===0) return { mcd:'—', mcm:'—', resumen: T.error };
  const A=a, B=b; while (b) { [a,b]=[b,a%b]; }
  const mcm=(A*B)/a;
  const resumen = __lang === 'pt'
    ? `MDC(${A},${B})=${a}, MMC=${mcm}.`
    : `MCD(${A},${B})=${a}, MCM=${mcm}.`;
  return { mcd:a.toString(), mcm:mcm.toLocaleString(), resumen };
}
