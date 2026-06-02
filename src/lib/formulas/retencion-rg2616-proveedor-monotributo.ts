export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function retencionRg2616ProveedorMonotributo(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const t=String(i.tipo||'servicio');
  const iva=t==='servicio'?m*0.105:m*0.105;
  const gan=m*0.035;
  const total=iva+gan;
  const fmt=(n:number)=>'$'+Math.round(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const neto=m-total;
  const pctTotal=m>0?(total/m)*100:0;
  return {
    retencionIVA:fmt(iva), retencionGan:fmt(gan), total:fmt(total),
    resumen:`$${m.toLocaleString('es-AR')} ${t}: retención total $${total.toFixed(0)}.`,
    _insight:{
      title:'Cuánto te retienen',
      text:`Sobre ${fmt(m)} te retienen **${fmt(total)}** (el **${pctTotal.toFixed(1)}%**): ${fmt(iva)} de IVA y ${fmt(gan)} de Ganancias. Cobrás **${fmt(neto)}** netos, pero esas retenciones son pago a cuenta: las descontás en tu próxima DDJJ o pedís devolución si te sobran.`,
      tone:'warn',
      icon:'🧾'
    },
    _chart: m>0 ? {
      type:'doughnut',
      slices:[
        {label:'Neto a cobrar', value:Math.round(neto)},
        {label:'Retención IVA', value:Math.round(iva)},
        {label:'Retención Ganancias', value:Math.round(gan)}
      ],
      prefix:'$',
      centerValue:fmt(m),
      centerLabel:'Monto bruto',
      ariaLabel:`De ${fmt(m)} brutos: ${fmt(neto)} netos, ${fmt(iva)} de retención IVA y ${fmt(gan)} de retención Ganancias.`
    } : undefined
  };
}
