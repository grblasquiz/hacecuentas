export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
// Costo de escrituración del COMPRADOR como % del valor (estimación rápida, alícuotas fijas).
// ITI (1,5%) DEROGADO por la Ley 27.743 (art. 67, B.O. 08/07/2024): ya no integra el costo.
// El impuesto del vendedor pasó a Ganancias cedular 15% sobre la GANANCIA (no sobre el valor) para
// inmuebles adquiridos desde 2018 (anteriores a 2018: exentos). Es un costo del vendedor, aparte del
// presupuesto del comprador → no se suma acá. Para computarlo, ver calculadora-gastos-escritura-compra-inmueble.
export function costoEscrituraInmueblePorcentajeValor(i: Inputs): Outputs {
  const v=Number(i.valorInmueble)||0; const j=String(i.jurisdiccion||'caba');
  const hon=v*0.015;
  const sellos=v*0.035;
  const aportes=v*0.01;
  const total=hon+sellos+aportes;
  const sep=(n:number)=>n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const pct=v>0?(total/v*100).toFixed(1):'0';
  const _insight={
    title:'Gastos de escritura sobre el valor',
    text:`Escriturar este inmueble de **$${sep(v)}** suma **$${sep(total)}** en gastos del comprador, un **${pct}%** del valor. El bocado más grande son los **sellos** ($${sep(sellos)}), un impuesto provincial que suele dividirse 50/50 con el vendedor. Tenelos aparte del precio: van además de la seña. El viejo ITI (1,5%) fue derogado en 2024 — lo del vendedor hoy es Ganancias cedular sobre la ganancia, aparte.`,
    tone:'warn',
    icon:'🏠',
  };
  const _chart={
    type:'doughnut',
    slices:[
      {label:'Sellos',value:Math.round(sellos)},
      {label:'Honorarios escribano',value:Math.round(hon)},
      {label:'Aportes',value:Math.round(aportes)},
    ].filter((s)=>s.value>0),
    prefix:'$',
    centerValue:'$'+sep(total),
    centerLabel:'Gastos totales',
    ariaLabel:`Composición de los gastos de escritura del comprador: sellos $${sep(sellos)}, honorarios del escribano $${sep(hon)}, aportes $${sep(aportes)}.`,
  };
  return { honorarios:'$'+sep(hon), impuestos:'$'+sep(sellos), total:'$'+sep(total), resumen:`Inmueble $${v.toLocaleString('es-AR')} en ${j.toUpperCase()}: ~$${total.toFixed(0)} total (${(total/v*100).toFixed(1)}%).`, _insight, _chart };
}
