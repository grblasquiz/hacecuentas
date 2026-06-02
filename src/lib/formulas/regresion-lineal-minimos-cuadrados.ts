export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
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
  const pct = (r2 * 100).toFixed(1);
  const calidad = r2 >= 0.9 ? 'muy fuerte' : r2 >= 0.7 ? 'fuerte' : r2 >= 0.5 ? 'moderado' : r2 >= 0.3 ? 'débil' : 'muy débil';
  const tone = r2 >= 0.7 ? 'good' : r2 >= 0.5 ? 'neutral' : 'warn';
  const dir = m > 0 ? 'positiva (Y sube cuando X sube)' : m < 0 ? 'negativa (Y baja cuando X sube)' : 'plana';
  const _insight = {
    title: `Ajuste ${calidad}`,
    text: `La recta **y = ${m.toFixed(3)}x + ${b.toFixed(3)}** explica el **${pct}%** de la variación de Y (R² = ${r2.toFixed(3)}). La relación es ${dir}.`,
    tone,
    icon: '📉',
  };
  const _chart = {
    type: 'scale',
    marker: Math.max(0, Math.min(1, Number(r2.toFixed(4)))),
    markerLabel: `R² ${r2.toFixed(2)}`,
    min: 0,
    segments: [
      { nombre: 'Débil', max: 0.5, color: '#f87171', colorDark: '#b91c1c' },
      { nombre: 'Moderado', max: 0.7, color: '#fbbf24', colorDark: '#b45309' },
      { nombre: 'Fuerte', max: 0.9, color: '#4ade80', colorDark: '#15803d' },
      { nombre: 'Muy fuerte', max: 1, color: '#22c55e', colorDark: '#166534' },
    ],
    ariaLabel: `Bondad de ajuste R² de ${r2.toFixed(2)} en una escala de 0 a 1`,
  };
  return { m:m.toFixed(4), b:b.toFixed(4), r2:r2.toFixed(4), resumen:`y = ${m.toFixed(3)}x + ${b.toFixed(3)}, R² = ${r2.toFixed(3)}.`, _insight, _chart };
}
