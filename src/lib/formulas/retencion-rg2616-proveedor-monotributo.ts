export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function retencionRg2616ProveedorMonotributo(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const t=String(i.tipo||'servicio');
  const iva=t==='servicio'?m*0.105:m*0.105;
  const gan=m*0.035;
  const total=iva+gan;
  return { retencionIVA:'$'+iva.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), retencionGan:'$'+gan.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), total:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`$${m.toLocaleString('es-AR')} ${t}: retención total $${total.toFixed(0)}.` };
}
