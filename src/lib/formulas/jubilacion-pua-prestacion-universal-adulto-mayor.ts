export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function jubilacionPuaPrestacionUniversalAdultoMayor(i: Inputs): Outputs {
  const e=Number(i.edad)||0; const a=String(i.aportes||'no')==='si';
  const accede=e>=65 && !a;
  const monto=accede?232000:0;
  return { monto:'$'+monto.toLocaleString('es-AR'), accede:accede?'Sí, cumple requisitos':(a?'No - tiene aportes (va jubilación)':'No - edad <65'), resumen:accede?`Acceso PUAM: $${monto}/mes.`:'No aplica PUAM.' };
}
