export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conexionesDbPoolMaxConcurrentes(i: Inputs): Outputs {
  const c=Number(i.cores)||1; const carga=String(i.carga||'med');
  const mult:Record<string,number>={baja:1,med:2,alta:3};
  const mx=c*(mult[carga]||2);
  const mn=Math.max(2,Math.floor(mx/4));
  return { min:mn.toString(), max:mx.toString(), consejo:'Usar PgBouncer si excede 200', resumen:`DB ${c} cores, carga ${carga}: pool ${mn}-${mx}.` };
}
