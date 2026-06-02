export interface Inputs { [k: string]: number | string; }
export interface Outputs { sigma: string; varianza: string; media: string; resumen: string; _insight?: any; _chart?: any; [k: string]: any; }
export function desvioEstandarVarianzaConjunto(i: Inputs): Outputs {
  const s=String(i.datos||''); const arr=s.split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x));
  if (arr.length===0) return { sigma:'—', varianza:'—', media:'—', resumen:'Sin datos.' };
  const m=arr.reduce((a,b)=>a+b,0)/arr.length;
  const denom=String(i.tipo)==='mue'?arr.length-1:arr.length;
  if (denom<=0) return { sigma:'—', varianza:'—', media:m.toFixed(2), resumen:'Muestra necesita n≥2.' };
  const v=arr.reduce((a,b)=>a+(b-m)**2,0)/denom;
  const sigma=Math.sqrt(v);
  const cv = Math.abs(m) > 1e-12 ? (sigma / Math.abs(m)) * 100 : 0;
  const tipoLabel = String(i.tipo)==='mue' ? 'muestral (s)' : 'poblacional (σ)';
  let _insight: any;
  let _chart: any;
  if (cv > 0) {
    const dispersion = cv < 15 ? 'baja (datos homogéneos)' : cv < 30 ? 'moderada' : 'alta (datos muy dispersos)';
    const tone = cv < 15 ? 'good' : cv < 30 ? 'neutral' : 'warn';
    _insight = {
      title: 'Qué tan dispersos están tus datos',
      text: `Sobre ${arr.length} datos, σ ${tipoLabel} es **${sigma.toFixed(2)}** y la media **${m.toFixed(2)}**, con un coeficiente de variación de **${cv.toFixed(1)}%**: dispersión **${dispersion}**.`,
      tone,
      icon: '📊',
    };
    const topGauge = Math.max(45, cv * 1.15);
    _chart = {
      type: 'scale',
      marker: Number(cv.toFixed(2)),
      markerLabel: `CV ${cv.toFixed(1)}%`,
      min: 0,
      segments: [
        { nombre: 'Baja', max: 15, color: '#22c55e', colorDark: '#15803d' },
        { nombre: 'Moderada', max: 30, color: '#f59e0b', colorDark: '#b45309' },
        { nombre: 'Alta', max: Number(topGauge.toFixed(2)), color: '#ef4444', colorDark: '#b91c1c' },
      ],
      ariaLabel: `Coeficiente de variación de ${cv.toFixed(1)}%, dispersión ${dispersion}.`,
    };
  } else {
    _insight = {
      title: 'Qué tan dispersos están tus datos',
      text: `Sobre ${arr.length} datos, σ ${tipoLabel} es **${sigma.toFixed(2)}** y la varianza **${v.toFixed(2)}** (media **${m.toFixed(2)}**).`,
      tone: 'neutral',
      icon: '📊',
    };
  }
  return { sigma:sigma.toFixed(3), varianza:v.toFixed(3), media:m.toFixed(3), resumen:`σ=${sigma.toFixed(2)}, σ²=${v.toFixed(2)}.`, _insight, _chart };
}
