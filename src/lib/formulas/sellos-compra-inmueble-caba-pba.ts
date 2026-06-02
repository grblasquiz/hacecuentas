export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function sellosCompraInmuebleCabaPba(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const j=String(i.jurisdiccion||'caba'); const u=String(i.viviendaUnica||'no')==='si';
  const topeUnica=j==='caba'?350000000:300000000;
  let base=v;
  if (u && v<=topeUnica) base=0;
  else if (u) base=v-topeUnica;
  const imp=base*0.035;
  const fmtImp='$'+imp.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const fmtTope='$'+topeUnica.toLocaleString('es-AR');
  let insightText:string; let insightTone:string;
  if (u && v<=topeUnica) {
    insightText=`Por ser **vivienda única** y estar por debajo del tope de ${fmtTope} en ${j.toUpperCase()}, quedás **exento del impuesto de sellos**: ahorrás los $${(v*0.035).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.')} que pagarías sin el beneficio.`;
    insightTone='good';
  } else if (u) {
    insightText=`Aunque es vivienda única, el valor supera el tope de ${fmtTope}: pagás **${fmtImp}** de sellos solo sobre el excedente (1,75% que suele dividirse entre comprador y vendedor).`;
    insightTone='warn';
  } else {
    insightText=`El impuesto de sellos sobre $${v.toLocaleString('es-AR')} en ${j.toUpperCase()} es de **${fmtImp}** (3,5% del valor). En la práctica suele repartirse 1,75% comprador y 1,75% vendedor; presupuestalo aparte de la seña.`;
    insightTone='warn';
  }
  const insight={title:'Impuesto de sellos',text:insightText,tone:insightTone,icon:'🏡'};
  return { sellos:fmtImp, alicuota:'3.5%', resumen:`$${v.toLocaleString('es-AR')} en ${j.toUpperCase()}: sellos $${imp.toFixed(0)}${u?' (vivienda única)':''}.`, _insight: insight };
}
