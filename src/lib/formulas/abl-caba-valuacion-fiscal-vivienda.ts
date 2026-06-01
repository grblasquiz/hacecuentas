export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function ablCabaValuacionFiscalVivienda(i: Inputs): Outputs {
  const v=Number(i.valuacion)||0;
  let alic=0.008; if (v>10000000) alic=0.012; if (v>25000000) alic=0.015; if (v>50000000) alic=0.018; if (v>100000000) alic=0.02;
  const anual=v*alic;

  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const alicPct=(alic*100).toLocaleString('es-AR',{maximumFractionDigits:1});
  const _insight={
    title:'Tu ABL anual estimado',
    text:`Con una valuación fiscal de **${fmt(v)}** te corresponde la alícuota del **${alicPct}%**, lo que da un ABL de **${fmt(anual)}/año** (**${fmt(anual/12)}/mes**).`,
    tone: alic>=0.018 ? 'warn' : 'neutral',
    icon:'🏠'
  };
  const _chart={
    type:'scale',
    marker: v,
    markerLabel:`Valuación ${fmt(v)} · ${alicPct}%`,
    min: 0,
    segments:[
      {nombre:'0,8%', max:10000000, color:'#22c55e', colorDark:'#16a34a'},
      {nombre:'1,2%', max:25000000, color:'#84cc16', colorDark:'#65a30d'},
      {nombre:'1,5%', max:50000000, color:'#f59e0b', colorDark:'#d97706'},
      {nombre:'1,8%', max:100000000, color:'#f97316', colorDark:'#ea580c'},
      {nombre:'2,0%', max: Math.max(150000000, v*1.15), color:'#ef4444', colorDark:'#dc2626'}
    ],
    ariaLabel:`Tramo de alícuota del ABL según valuación fiscal; tu valuación de ${fmt(v)} aplica ${alicPct}%.`
  };

  return { ablAnual:'$'+anual.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), ablMensual:'$'+(anual/12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Valuación $${v.toLocaleString('es-AR')}: ABL $${anual.toFixed(0)}/año.`, _insight, _chart };
}
