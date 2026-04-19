export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function progresarBecaMontoRequisitos2026(i: Inputs): Outputs {
  const n=String(i.nivel||'uni');
  const m: Record<string,number> = { sec:25000, ter:30000, uni:40000, trab:30000 };
  return { monto:'$'+(m[n]||30000).toLocaleString('es-AR'), requisitos:'16-24 años, ingreso familiar ≤3 SMVM, escolaridad regular', resumen:`Beca Progresar ${n}: $${(m[n]||30000).toLocaleString('es-AR')}/mes.` };
}
