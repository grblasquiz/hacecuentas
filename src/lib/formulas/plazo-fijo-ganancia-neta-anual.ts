export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function plazoFijoGananciaNetaAnual(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.` };
}
