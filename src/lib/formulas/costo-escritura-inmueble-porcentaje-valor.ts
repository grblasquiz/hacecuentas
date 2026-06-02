export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoEscrituraInmueblePorcentajeValor(i: Inputs): Outputs {
  const v=Number(i.valorInmueble)||0; const j=String(i.jurisdiccion||'caba');
  const hon=v*0.015;
  const sellos=v*0.035;
  const iti=v*0.015;
  const aportes=v*0.01;
  const total=hon+sellos+iti+aportes;
  const sep=(n:number)=>n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const pct=v>0?(total/v*100).toFixed(1):'0';
  const _insight={
    title:'Gastos de escritura sobre el valor',
    text:`Escriturar este inmueble de **$${sep(v)}** suma **$${sep(total)}** en gastos, un **${pct}%** del valor. El bocado más grande son los **sellos** ($${sep(sellos)}); junto al ITI son impuestos provinciales que no se negocian. Tenelos aparte del precio: van además de la seña.`,
    tone:'warn',
    icon:'🏠',
  };
  const _chart={
    type:'doughnut',
    slices:[
      {label:'Sellos',value:Math.round(sellos)},
      {label:'Honorarios escribano',value:Math.round(hon)},
      {label:'ITI',value:Math.round(iti)},
      {label:'Aportes',value:Math.round(aportes)},
    ].filter((s)=>s.value>0),
    prefix:'$',
    centerValue:'$'+sep(total),
    centerLabel:'Gastos totales',
    ariaLabel:`Composición de los gastos de escritura: sellos $${sep(sellos)}, honorarios del escribano $${sep(hon)}, ITI $${sep(iti)}, aportes $${sep(aportes)}.`,
  };
  return { honorarios:'$'+sep(hon), impuestos:'$'+sep(sellos+iti), total:'$'+sep(total), resumen:`Inmueble $${v.toLocaleString('es-AR')} en ${j.toUpperCase()}: ~$${total.toFixed(0)} total (${(total/v*100).toFixed(1)}%).`, _insight, _chart };
}
