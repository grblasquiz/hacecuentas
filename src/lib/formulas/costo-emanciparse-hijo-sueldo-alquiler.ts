export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoEmanciparseHijoSueldoAlquiler(i: Inputs): Outputs {
  const a=Number(i.alquiler)||0; const g=Number(i.gastos)||0;
  const regla30=a/0.3;
  const piso=a+g+200;
  const min=Math.max(regla30,piso);
  const pctAlquiler=min>0?Math.round((a/min)*100):0;
  const manda=regla30>=piso?'regla del 30%':'alquiler + gastos fijos';
  const _insight={
    title:'Cuánto tiene que ganar para irse',
    text:`Para bancar un alquiler de **$${a.toFixed(0)}** necesita ganar al menos **$${min.toFixed(0)}** netos por mes (manda la ${manda}). Así el alquiler queda en el **${pctAlquiler}%** del sueldo. Sumale **$${(a*3).toFixed(0)}** de ahorro previo (3 meses) para depósito y primer mes.`,
    tone:pctAlquiler>35?'warn':'good',
    icon:'🏠',
  };
  return { sueldoMin:`$${min.toFixed(0)}`, ahorro:`$${(a*3).toFixed(0)} (3 meses)`, resumen:`Alquiler $${a} + gastos $${g}: sueldo mínimo ~$${min.toFixed(0)}.`, _insight };
}
