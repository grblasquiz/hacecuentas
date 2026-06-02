export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function haberMinimoJubilatorio2026BonoTotal(i: Inputs): Outputs {
  const h=Number(i.haberBase)||0; const tb=String(i.tieneBono||'no');
  const bono=tb==='si'?70000:0; const t=h+bono;
  const fmtAr=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const pct=t>0?Math.round((bono/t)*100):0;
  const _insight=bono>0
    ? { title:'El bono suma a tu haber', text:`Cobrás **${fmtAr(t)}** en total: tu haber base de ${fmtAr(h)} más el **bono de ${fmtAr(bono)}**, que representa el **${pct}%** del depósito. El bono es refuerzo y no se incorpora al haber permanente.`, tone:'good', icon:'💵' }
    : { title:'Haber sin bono', text:`Tu depósito es de **${fmtAr(t)}**, sin bono extraordinario. Si te corresponde el refuerzo de ${fmtAr(70000)}, marcalo para ver el total actualizado.`, tone:'neutral', icon:'🧓' };
  const out:Outputs={ total:fmtAr(t), bono:bono>0?'+'+fmtAr(bono):'No aplica', interpretacion:tb==='si'?`Haber base ${fmtAr(h)} + bono ${fmtAr(bono)} = ${fmtAr(t)}.`:`Haber sin bono: ${fmtAr(t)}.`, _insight };
  if(bono>0 && h>0){
    out._chart={ type:'doughnut', slices:[{label:'Haber base',value:Math.round(h)},{label:'Bono',value:Math.round(bono)}], prefix:'$', centerValue:fmtAr(t), centerLabel:'Total a cobrar', ariaLabel:'Composición del depósito jubilatorio: haber base más bono extraordinario' };
  }
  return out;
}
