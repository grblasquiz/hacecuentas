export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function ablCabaValuacionFiscalActualizada2026(i: Inputs): Outputs {
  const v=Number(i.valuacionFiscal)||0; const u=String(i.unicaVivienda||'no');
  let aliq=0.006;
  if(v>50000000) aliq=0.008;
  if(v>100000000) aliq=0.01;
  if(v>200000000) aliq=0.012;
  const descuento=u==='si'?0.8:1;
  const anual=v*aliq*descuento;

  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const aliqPct=(aliq*100).toLocaleString('es-AR',{maximumFractionDigits:1});
  const _insight={
    title:'Tu ABL estimado',
    text: u==='si'
      ? `Con una valuación de **${fmt(v)}** caés en la alícuota del **${aliqPct}%** y el ABL ronda **${fmt(anual)}/año** (**${fmt(anual/12)}/mes**), ya con el **descuento del 20%** por única vivienda aplicado.`
      : `Con una valuación de **${fmt(v)}** la alícuota es del **${aliqPct}%** y el ABL ronda **${fmt(anual)}/año** (**${fmt(anual/12)}/mes**). Si fuera tu única vivienda podrías acceder a un **20% de descuento**.`,
    tone: u==='si' ? 'good' : 'neutral',
    icon:'🏠'
  };
  const _chart={
    type:'scale',
    marker: v,
    markerLabel:`Valuación ${fmt(v)} · ${aliqPct}%`,
    min: 0,
    segments:[
      {nombre:'0,6%', max:50000000, color:'#22c55e', colorDark:'#16a34a'},
      {nombre:'0,8%', max:100000000, color:'#84cc16', colorDark:'#65a30d'},
      {nombre:'1,0%', max:200000000, color:'#f59e0b', colorDark:'#d97706'},
      {nombre:'1,2%', max: Math.max(300000000, v*1.15), color:'#ef4444', colorDark:'#dc2626'}
    ],
    ariaLabel:`Tramo de alícuota del ABL según valuación fiscal; tu valuación de ${fmt(v)} aplica ${aliqPct}%.`
  };

  return { ablAnual:`$${Math.round(anual).toLocaleString('es-AR')}`, ablMensual:`$${Math.round(anual/12).toLocaleString('es-AR')}`, descuento:u==='si'?'20% única vivienda aplicado':'Sin descuento', _insight, _chart };
}
