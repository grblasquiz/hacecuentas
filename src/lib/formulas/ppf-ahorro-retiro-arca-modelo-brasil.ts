export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ppfAhorroRetiroArcaModeloBrasil(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const totalPagado=r*p;
  const interes=Math.max(0,totalPagado-m);
  const pctInteres=totalPagado>0?interes/totalPagado*100:0;
  const tone=pctInteres>=30?'warn':pctInteres>0?'neutral':'good';
  const insight={
    title:'Cuánto pagás de más',
    text:interes>0
      ? `Vas a pagar **${fmt(r)}/mes** durante **${p} meses**, es decir **${fmt(totalPagado)}** en total. De eso, **${fmt(interes)}** son intereses (**${pctInteres.toFixed(0)}%** de lo que devolvés por encima del capital de ${fmt(m)}).`
      : `Sin interés, devolvés exactamente el capital de **${fmt(m)}** en **${p} cuotas** de **${fmt(r)}** cada una.`,
    tone,
    icon:'💰',
  };
  const out:Outputs={ resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`, _insight:insight };
  if(interes>0){
    out._chart={
      type:'doughnut',
      slices:[
        {label:'Capital',value:Math.round(m)},
        {label:'Intereses',value:Math.round(interes)},
      ],
      prefix:'$',
      centerValue:fmt(totalPagado),
      centerLabel:'Total a pagar',
      ariaLabel:`Del total de ${fmt(totalPagado)}, ${fmt(m)} es capital y ${fmt(interes)} son intereses.`,
    };
  }
  return out;
}
