export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cuotaCreditoHipotecarioUvaBancoNacion(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const p=Number(i.plazoAnios)||0; const tna=(Number(i.tnaReal)||0)/100;
  const n=p*12; const i_m=tna/12;
  const cuota=i_m===0?m/n:m*i_m*Math.pow(1+i_m,n)/(Math.pow(1+i_m,n)-1);
  const total=cuota*n;
  return { cuotaInicial:'$'+cuota.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), totalPagar:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`$${m.toLocaleString('es-AR')} × ${p} años @ ${(tna*100).toFixed(1)}%: cuota $${cuota.toFixed(0)}/mes.` };
}
