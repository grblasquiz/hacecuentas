export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoEmanciparseHijoSueldoAlquiler(i: Inputs): Outputs {
  const a=Number(i.alquiler)||0; const g=Number(i.gastos)||0;
  const min=Math.max(a/0.3,a+g+200);
  return { sueldoMin:`$${min.toFixed(0)}`, ahorro:`$${(a*3).toFixed(0)} (3 meses)`, resumen:`Alquiler $${a} + gastos $${g}: sueldo mínimo ~$${min.toFixed(0)}.` };
}
