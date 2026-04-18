export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function leasingAutoMensualVsCompra(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const r=Number(i.residual)||0; const m=Number(i.meses)||36; const t=Number(i.tasa)||10;
  const vr=v*r/100;
  const i_m=t/100/12;
  const cuota=((v-vr)/m)+(v+vr)/2*i_m;
  return { cuota:`$${cuota.toFixed(2)}`, totalPago:`$${(cuota*m+vr).toFixed(0)}`, resumen:`Leasing ${m} meses: $${cuota.toFixed(0)}/mes, residual $${vr.toFixed(0)}.` };
}
