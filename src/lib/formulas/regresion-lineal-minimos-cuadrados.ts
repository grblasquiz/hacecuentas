export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function regresionLinealMinimosCuadrados(i: Inputs): Outputs {
  const xs=String(i.x||'').split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x));
  const ys=String(i.y||'').split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x));
  const n=Math.min(xs.length,ys.length);
  if (n<2) return { m:'—', b:'—', r2:'—', resumen:'Necesita ≥2 pares (x,y).' };
  const mx=xs.slice(0,n).reduce((a,b)=>a+b,0)/n; const my=ys.slice(0,n).reduce((a,b)=>a+b,0)/n;
  let num=0, den=0, sst=0;
  for (let k=0;k<n;k++) { num+=(xs[k]-mx)*(ys[k]-my); den+=(xs[k]-mx)**2; sst+=(ys[k]-my)**2; }
  if (den===0) return { m:'—', b:'—', r2:'—', resumen:'Datos X constantes.' };
  const m=num/den; const b=my-m*mx;
  let ssr=0; for (let k=0;k<n;k++) ssr+=(ys[k]-(m*xs[k]+b))**2;
  const r2=sst===0?1:1-ssr/sst;
  return { m:m.toFixed(4), b:b.toFixed(4), r2:r2.toFixed(4), resumen:`y = ${m.toFixed(3)}x + ${b.toFixed(3)}, R² = ${r2.toFixed(3)}.` };
}
