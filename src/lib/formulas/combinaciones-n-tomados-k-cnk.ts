export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function combinacionesNTomadosKCnk(i: Inputs): Outputs {
  const n=Math.floor(Number(i.n)||0); const k=Math.floor(Number(i.k)||0);
  if (k<0||k>n) return {
    resultado:'0',
    resumen:'k fuera de rango [0,n].',
    _insight: {
      title: 'Valores fuera de rango',
      text: `No se puede elegir **${k}** elementos de un conjunto de **${n}**: k tiene que estar entre 0 y n. Ajustá los valores para obtener un resultado válido.`,
      tone: 'warn',
      icon: '🔢',
    },
  };
  let c=1; const m=Math.min(k,n-k);
  for (let j=0;j<m;j++) c=c*(n-j)/(j+1);
  const res=Math.round(c);
  const _insight = {
    title: 'Cuántas combinaciones hay',
    text: `Elegir **${k}** elementos de **${n}** sin importar el orden da **${res.toLocaleString()}** combinaciones posibles. Como no cuenta el orden, C(${n},${k}) es igual a C(${n},${n-k}).`,
    tone: 'neutral',
    icon: '🔢',
  };
  return { resultado:res.toLocaleString(), resumen:`C(${n},${k}) = ${res.toLocaleString()}.`, _insight };
}
