export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function reintegroIvaComprasTarjetaDebito(i: Inputs): Outputs {
  const cb=Number(i.compraBruta)||0; const pr=Number(i.porcentajeReintegro)||0;
  const ivaContenido=cb-(cb/1.21); const reint=ivaContenido*(pr/100); const neto=cb-reint;
  return { reintegro:`$${Math.round(reint).toLocaleString('es-AR')}`, netoFinal:`$${Math.round(neto).toLocaleString('es-AR')}`, interpretacion:`Reintegro estimado ${pr}% del IVA contenido. Ahorrás ${(reint/cb*100).toFixed(1)}% del total.` };
}
