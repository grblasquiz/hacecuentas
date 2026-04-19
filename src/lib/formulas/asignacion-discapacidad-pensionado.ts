export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function asignacionDiscapacidadPensionado(i: Inputs): Outputs {
  const c=String(i.cdu||'no')==='si'; const g=Number(i.gradoDeps)||0;
  const acceso=c && g>=76;
  const monto=acceso?200000:0;
  return { monto:'$'+monto.toLocaleString('es-AR'), acceso:acceso?'Sí':'No (requiere CUD + ≥76%)', resumen:acceso?`Acceso habilitado: $${monto.toLocaleString('es-AR')}/mes.`:'No cumple requisitos.' };
}
