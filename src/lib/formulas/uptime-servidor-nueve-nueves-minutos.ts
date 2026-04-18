export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function uptimeServidorNueveNuevesMinutos(i: Inputs): Outputs {
  const sla=Number(i.sla)||99;
  const dt=(1-sla/100)*525600;
  return { anual:`${dt.toFixed(1)} min/año`, mensual:`${(dt/12).toFixed(1)} min/mes`, diario:`${(dt/365).toFixed(2)} min/día`, resumen:`SLA ${sla}%: ${dt.toFixed(1)} min/año downtime permitido.` };
}
