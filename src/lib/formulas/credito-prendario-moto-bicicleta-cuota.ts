export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function creditoPrendarioMotoBicicletaCuota(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const totalPagado=r*p; const intereses=Math.max(0,totalPagado-m);
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const sobrecosto=m>0?(intereses/m)*100:0;
  const _insight={
    title:'Esto te cuesta el crédito',
    text:`Vas a pagar **${fmt(r)}/mes** durante **${p} meses**. En total devolvés **${fmt(totalPagado)}** por un préstamo de **${fmt(m)}**: los intereses suman **${fmt(intereses)}** (un **${Math.round(sobrecosto)}%** extra sobre el monto).`,
    tone:(sobrecosto>=50?'warn':'neutral') as 'warn'|'neutral',
    icon:'🏍️'
  };
  const _chart=intereses>0?{
    type:'doughnut',
    slices:[
      {label:'Capital prestado',value:Math.round(m)},
      {label:'Intereses',value:Math.round(intereses)}
    ],
    prefix:'$',
    centerValue:fmt(totalPagado),
    centerLabel:'Total a pagar',
    ariaLabel:`Sobre un total de ${fmt(totalPagado)}, ${fmt(m)} es capital y ${fmt(intereses)} son intereses.`
  }:undefined;
  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`, _insight, _chart };
}
