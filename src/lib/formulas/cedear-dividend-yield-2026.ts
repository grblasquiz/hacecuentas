export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cedearDividendYield2026(i: Inputs): Outputs {
  const p=Number(i.precioCedear)||0; const r=Number(i.ratioConversion)||1;
  const d=Number(i.dividendoAnualUsd)||0; const c=Number(i.cotizacionDolar)||1;
  const divPorCedear=d/r*c; const dy=p>0?(divPorCedear/p*100):0; const ing100=divPorCedear*100;
  return { dividendYield:`${dy.toFixed(2)}%`, ingresoEn100:`$${Math.round(ing100).toLocaleString('es-AR')}`, interpretacion:`Rinde ~${dy.toFixed(1)}% anual en dividendos. Con 100 CEDEARs: $${Math.round(ing100).toLocaleString('es-AR')}/año.` };
}
