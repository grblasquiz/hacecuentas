export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ablCabaValuacionFiscalActualizada2026(i: Inputs): Outputs {
  const v=Number(i.valuacionFiscal)||0; const u=String(i.unicaVivienda||'no');
  let aliq=0.006;
  if(v>50000000) aliq=0.008;
  if(v>100000000) aliq=0.01;
  if(v>200000000) aliq=0.012;
  const descuento=u==='si'?0.8:1;
  const anual=v*aliq*descuento;
  return { ablAnual:`$${Math.round(anual).toLocaleString('es-AR')}`, ablMensual:`$${Math.round(anual/12).toLocaleString('es-AR')}`, descuento:u==='si'?'20% única vivienda aplicado':'Sin descuento' };
}
