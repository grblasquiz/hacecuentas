export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function reintegroIvaComprasTarjetaDebito(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const cb=Number(i.compraBruta)||0; const pr=Number(i.porcentajeReintegro)||0;
  const ivaContenido=cb-(cb/1.21); const reint=ivaContenido*(pr/100); const neto=cb-reint;
  const interpretacion = __lang === 'en'
    ? `Estimated ${pr}% VAT refund on the included tax. You save ${(reint/cb*100).toFixed(1)}% of the total.`
    : `Reintegro estimado ${pr}% del IVA contenido. Ahorrás ${(reint/cb*100).toFixed(1)}% del total.`;
  return { reintegro:`$${Math.round(reint).toLocaleString('es-AR')}`, netoFinal:`$${Math.round(neto).toLocaleString('es-AR')}`, interpretacion };
}
