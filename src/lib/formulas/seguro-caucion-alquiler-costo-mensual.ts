export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function seguroCaucionAlquilerCostoMensual(i: Inputs): Outputs {
  const a=Number(i.alquilerMensual)||0; const p=Number(i.plazo)||24;
  const tasa=p===12?0.10:p===24?0.15:0.20;
  const prima=a*tasa;
  return { prima:'$'+prima.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), mensualizada:'$'+(prima/p).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Alquiler $${a.toLocaleString('es-AR')} × ${p} meses: prima $${prima.toFixed(0)}.` };
}
