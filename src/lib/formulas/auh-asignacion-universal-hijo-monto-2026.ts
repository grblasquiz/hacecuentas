export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function auhAsignacionUniversalHijoMonto2026(i: Inputs): Outputs {
  const h=Number(i.hijos)||0; const e=String(i.embarazo||'no')==='si';
  const porHijo=65000;
  const total=h*porHijo+(e?porHijo:0);
  const retenido=total*0.20;
  const cobro=total*0.80;
  return { auhMensual:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), retenido:'$'+retenido.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), cobroEfectivo:'$'+cobro.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`${h} hijos${e?' + embarazo':''}: AUH $${total.toFixed(0)}/mes, cobro efectivo $${cobro.toFixed(0)}.` };
}
