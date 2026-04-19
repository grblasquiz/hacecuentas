export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function visaTurismoPaisesCostoTiempo(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.` };
}
