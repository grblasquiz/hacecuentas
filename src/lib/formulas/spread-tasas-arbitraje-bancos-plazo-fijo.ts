export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function spreadTasasArbitrajeBancosPlazoFijo(i: Inputs): Outputs {
  const a=Number(i.tnaBancoA)||0; const b=Number(i.tnaBancoB)||0; const m=Number(i.monto)||0; const d=Number(i.dias)||30;
  const spread=b-a; const diff=m*spread/100*d/365;
  return { spreadAnual:`${spread.toFixed(1)}%`, diferencia30Dias:`+$${Math.round(diff).toLocaleString('es-AR')}`, interpretacion:spread>0?`Banco B rinde ${spread.toFixed(1)}pp más. En ${d} días ganás $${Math.round(diff).toLocaleString('es-AR')} más.`:'Banco A es mejor opción.' };
}
