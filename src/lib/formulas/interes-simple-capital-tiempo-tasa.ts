export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function interesSimpleCapitalTiempoTasa(i: Inputs): Outputs {
  const c=Number(i.c)||0; const tasa=Number(i.i)||0; const t=Number(i.t)||0;
  const I=c*tasa/100*t; const total=c+I;
  return { interes:`$${I.toFixed(2)}`, total:`$${total.toFixed(2)}`, resumen:`Capital ${c} al ${tasa}% durante ${t} años: intereses $${I.toFixed(0)}.` };
}
