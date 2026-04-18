export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function integralIndefinidaPolinomioCoefs(i: Inputs): Outputs {
  const s=String(i.coefs||''); const cs=s.split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x));
  if (cs.length===0) return { integral:'—', resumen:'Ingresá coeficientes.' };
  const n=cs.length-1;
  const terms=cs.map((c,k)=>{ const exp=n-k+1; const nc=c/exp; if (nc===0) return ''; const sign=nc<0?'-':(k===0?'':'+'); return `${sign}${Math.abs(nc).toFixed(2)}x^${exp}`; }).filter(Boolean).join('')+' + C';
  return { integral:terms, resumen:`∫ = ${terms}.` };
}
