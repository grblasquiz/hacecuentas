export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function registroDnrpaAuto0kmArancel(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const p=String(i.provincia||'caba');
  const dnrpa=85000+v*0.008;
  const sellos=v*(p==='pba'?0.02:0.015);
  const total=dnrpa+sellos;
  const fmt=(n:number)=>n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const pct=v>0?(total/v*100):0;
  const _insight={
    title:'Costo de patentar el 0km',
    text:`Inscribir un auto de $${fmt(v)} en ${p==='pba'?'PBA':'CABA'} cuesta unos **$${fmt(total)}** (~**${pct.toFixed(1)}%** del valor): **$${fmt(dnrpa)}** de arancel DNRPA y **$${fmt(sellos)}** de sellos provinciales. Sumalo al precio de lista antes de cerrar la compra.`,
    tone:'warn',
    icon:'🚗',
  };
  const _chart={
    type:'doughnut',
    slices:[
      { label:'Arancel DNRPA', value:Math.round(dnrpa) },
      { label:'Sellos provinciales', value:Math.round(sellos) },
    ],
    prefix:'$',
    centerValue:'$'+fmt(total),
    centerLabel:'Total a pagar',
    ariaLabel:`Desglose del costo de registro de $${fmt(total)}: arancel DNRPA $${fmt(dnrpa)} y sellos provinciales $${fmt(sellos)}.`,
  };
  return { dnrpa:'$'+fmt(dnrpa), sellos:'$'+fmt(sellos), total:'$'+fmt(total), resumen:`Auto $${v.toLocaleString('es-AR')} ${p}: registro $${total.toFixed(0)}.`, _insight, _chart };
}
