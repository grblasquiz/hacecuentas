export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ahorroUniversidadHijo18AniosCuota(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const a=Number(i.anios)||1; const t=Number(i.tasa)||0;
  const im=t/100/12; const n=a*12;
  const c=im===0?m/n:m*im/(Math.pow(1+im,n)-1);
  return { cuota:`$${c.toFixed(2)}`, totalAhorro:`$${(c*n).toFixed(0)}`, resumen:`Para $${m} en ${a} años: $${c.toFixed(0)}/mes.` };
}
