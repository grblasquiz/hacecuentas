export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function becasManuelBelgranoMonto(i: Inputs): Outputs {
  const c=String(i.carrera||'salud');
  const m: Record<string,number> = { salud:70000, cyt:60000, ing:75000, otra:50000 };
  return { monto:'$'+(m[c]||50000).toLocaleString('es-AR'), requisitos:'Ingreso ≤3 SMVM, promedio aprobado, carrera estratégica', resumen:`Beca Belgrano ${c}: $${(m[c]||50000).toLocaleString('es-AR')}/mes.` };
}
