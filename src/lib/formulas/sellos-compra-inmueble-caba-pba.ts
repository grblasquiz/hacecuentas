export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sellosCompraInmuebleCabaPba(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const j=String(i.jurisdiccion||'caba'); const u=String(i.viviendaUnica||'no')==='si';
  const topeUnica=j==='caba'?350000000:300000000;
  let base=v;
  if (u && v<=topeUnica) base=0;
  else if (u) base=v-topeUnica;
  const imp=base*0.035;
  return { sellos:'$'+imp.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), alicuota:'3.5%', resumen:`$${v.toLocaleString('es-AR')} en ${j.toUpperCase()}: sellos $${imp.toFixed(0)}${u?' (vivienda única)':''}.` };
}
