export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function patenteArgentinaAntiguedadVehiculo(i: Inputs): Outputs {
  const v=Number(i.valor)||0;
  const anual=v*0.045;
  return { cuotaAnual:`$${anual.toFixed(0)}`, mensual:`$${(anual/12).toFixed(0)}`, resumen:`Valor fiscal $${v.toLocaleString()}: patente ~$${anual.toFixed(0)}/año.` };
}
