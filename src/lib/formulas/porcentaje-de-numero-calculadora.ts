export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function porcentajeDeNumeroCalculadora(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const modo=String(i.modo||'deN'); const x=Number(i.x)||0; const n=Number(i.n)||0;
  if (modo==='deN') return { resultado:(n*x/100).toFixed(2), resumen: __lang==='en' ? `${x}% of ${n} = ${(n*x/100).toFixed(2)}.` : `${x}% de ${n} = ${(n*x/100).toFixed(2)}.` };
  if (n===0) return { resultado:'—', resumen: __lang==='en' ? 'B cannot be 0.' : 'B no puede ser 0.' };
  return { resultado:`${(x/n*100).toFixed(2)} %`, resumen: __lang==='en' ? `${x} is ${(x/n*100).toFixed(2)}% of ${n}.` : `${x} es ${(x/n*100).toFixed(2)}% de ${n}.` };
}
