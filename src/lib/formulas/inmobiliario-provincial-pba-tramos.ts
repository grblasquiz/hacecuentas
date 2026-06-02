export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function inmobiliarioProvincialPbaTramos(i: Inputs): Outputs {
  const v=Number(i.valuacion)||0;
  let alic=0.01; if (v>8000000) alic=0.015; if (v>20000000) alic=0.02; if (v>50000000) alic=0.025;
  const anual=v*alic;
  const fmt=(x:number)=>'$'+x.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const alicPct=(alic*100).toFixed(1).replace('.',',');
  return {
    inmob:fmt(anual),
    mensual:fmt(anual/12),
    resumen:`PBA valuación $${v.toLocaleString('es-AR')}: inmobiliario $${anual.toFixed(0)}/año.`,
    _insight: {
      title: 'Tu impuesto inmobiliario',
      text: `Con una valuación fiscal de **${fmt(v)}** caés en la alícuota del **${alicPct}%**: pagás **${fmt(anual)}** al año, unos **${fmt(anual/12)}** por mes.`,
      tone: 'warn',
      icon: '🏠',
    },
    _chart: {
      type: 'scale',
      marker: v,
      markerLabel: `Valuación ${fmt(v)} → ${alicPct}%`,
      min: 0,
      segments: [
        { nombre: '1,0%', max: 8000000, color: '#86efac', colorDark: '#22c55e' },
        { nombre: '1,5%', max: 20000000, color: '#fde68a', colorDark: '#f59e0b' },
        { nombre: '2,0%', max: 50000000, color: '#fdba74', colorDark: '#f97316' },
        { nombre: '2,5%', max: Math.max(80000000, v * 1.1), color: '#fca5a5', colorDark: '#ef4444' },
      ],
      ariaLabel: `Tramo de alícuota según valuación fiscal: tu propiedad tributa al ${alicPct}%`,
    },
  };
}
