export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function desvioEstandarVarianzaConjunto(i: Inputs): Outputs {
  const s=String(i.datos||''); const arr=s.split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x));
  if (arr.length===0) return { sigma:'—', varianza:'—', media:'—', resumen:'Sin datos.' };
  const m=arr.reduce((a,b)=>a+b,0)/arr.length;
  const denom=String(i.tipo)==='mue'?arr.length-1:arr.length;
  if (denom<=0) return { sigma:'—', varianza:'—', media:m.toFixed(2), resumen:'Muestra necesita n≥2.' };
  const v=arr.reduce((a,b)=>a+(b-m)**2,0)/denom;
  const sigma=Math.sqrt(v);
  return { sigma:sigma.toFixed(3), varianza:v.toFixed(3), media:m.toFixed(3), resumen:`σ=${sigma.toFixed(2)}, σ²=${v.toFixed(2)}.` };
}
