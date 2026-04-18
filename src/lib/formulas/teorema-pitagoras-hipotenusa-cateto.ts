export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function teoremaPitagorasHipotenusaCateto(i: Inputs): Outputs {
  const a=Number(i.a)||0; const b=Number(i.b)||0;
  const modo=String(i.modo||'hip');
  if (modo==='hip') { const c=Math.sqrt(a*a+b*b); return { resultado:`c=${c.toFixed(3)}`, resumen:`Hipotenusa: √(${a}²+${b}²)=${c.toFixed(2)}.` }; }
  if (a<=b) return { resultado:'—', resumen:'La hipotenusa debe ser mayor que el cateto.' };
  const cat=Math.sqrt(a*a-b*b);
  return { resultado:`cateto=${cat.toFixed(3)}`, resumen:`Cateto faltante: √(${a}²-${b}²)=${cat.toFixed(2)}.` };
}
