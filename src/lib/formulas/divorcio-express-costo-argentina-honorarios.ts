export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function divorcioExpressCostoArgentinaHonorarios(i: Inputs): Outputs {
  const c=String(i.comun||'si')==='si'; const h=String(i.hijosMenores||'no')==='si';
  const base=c?500000:2500000;
  const extra=h?200000:0;
  const total=base+extra;
  const tiempo=c?'3-6 meses':'1-3 años';
  return { costo:'$'+base.toLocaleString('es-AR')+(h?' + '+extra.toLocaleString('es-AR')+' hijos':''), tiempo, resumen:`Divorcio ${c?'común acuerdo':'contencioso'}${h?' con hijos':''}: ~$${total.toLocaleString('es-AR')}, ${tiempo}.` };
}
