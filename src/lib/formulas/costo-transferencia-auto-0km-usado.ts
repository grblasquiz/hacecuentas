export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoTransferenciaAuto0kmUsado(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const p=String(i.provincia||'caba');
  const ara=85000;
  const alicSe: Record<string,number> = { caba:0.015, pba:0.02, cba:0.02 };
  const sellos=v*(alicSe[p]||0.02);
  const total=ara+sellos;
  return { aranceles:'$'+ara.toLocaleString('es-AR'), impuestos:'$'+sellos.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), total:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Auto $${v.toLocaleString('es-AR')} en ${p.toUpperCase()}: transferencia ~$${total.toFixed(0)}.` };
}
