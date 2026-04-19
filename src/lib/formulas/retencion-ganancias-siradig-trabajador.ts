export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function retencionGananciasSiradigTrabajador(i: Inputs): Outputs {
  const s=Number(i.sueldoBrutoAnual)||0; const d=Number(i.deduccionesDeclaradas)||0;
  const baseSin=s*0.85; const baseCon=Math.max(0,s*0.85-d);
  const retSin=baseSin*0.25; const retCon=baseCon*0.25;
  return { retencionSinDec:'$'+retSin.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), retencionConDec:'$'+retCon.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), ahorro:'$'+(retSin-retCon).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Deducir $${d.toLocaleString('es-AR')}: ahorrás $${(retSin-retCon).toFixed(0)} de retención.` };
}
