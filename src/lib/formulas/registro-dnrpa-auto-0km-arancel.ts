export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function registroDnrpaAuto0kmArancel(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const p=String(i.provincia||'caba');
  const dnrpa=85000+v*0.008;
  const sellos=v*(p==='pba'?0.02:0.015);
  const total=dnrpa+sellos;
  return { dnrpa:'$'+dnrpa.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), sellos:'$'+sellos.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), total:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Auto $${v.toLocaleString('es-AR')} ${p}: registro $${total.toFixed(0)}.` };
}
