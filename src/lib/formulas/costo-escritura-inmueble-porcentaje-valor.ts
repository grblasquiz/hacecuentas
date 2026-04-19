export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoEscrituraInmueblePorcentajeValor(i: Inputs): Outputs {
  const v=Number(i.valorInmueble)||0; const j=String(i.jurisdiccion||'caba');
  const hon=v*0.015;
  const sellos=v*0.035;
  const iti=v*0.015;
  const aportes=v*0.01;
  const total=hon+sellos+iti+aportes;
  return { honorarios:'$'+hon.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), impuestos:'$'+(sellos+iti).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), total:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Inmueble $${v.toLocaleString('es-AR')} en ${j.toUpperCase()}: ~$${total.toFixed(0)} total (${(total/v*100).toFixed(1)}%).` };
}
