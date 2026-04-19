export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function becasJuanmarinPrimariasSecundarias(i: Inputs): Outputs {
  const c=String(i.ciclo||'sec');
  const m: Record<string,number> = { prim:20000, sec:30000 };
  const v=m[c]||20000;
  return { monto:'$'+v.toLocaleString('es-AR'), total10m:'$'+(v*10).toLocaleString('es-AR'), resumen:`Beca ${c}: $${v.toLocaleString('es-AR')}/mes × 10 = $${(v*10).toLocaleString('es-AR')}.` };
}
