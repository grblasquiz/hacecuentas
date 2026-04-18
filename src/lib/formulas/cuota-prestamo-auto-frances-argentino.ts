export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cuotaPrestamoAutoFrancesArgentino(i: Inputs): Outputs {
  const v=Number(i.v)||0; const n=Number(i.meses)||1; const tna=Number(i.tna)||0;
  const i_m=tna/100/12;
  const c=i_m===0?v/n:v*i_m*Math.pow(1+i_m,n)/(Math.pow(1+i_m,n)-1);
  const total=c*n;
  return { cuota:`$${c.toFixed(2)}`, total:`$${total.toFixed(2)}`, interes:`$${(total-v).toFixed(2)}`, resumen:`Cuota $${c.toFixed(0)}, total $${total.toFixed(0)} (interés $${(total-v).toFixed(0)}).` };
}
