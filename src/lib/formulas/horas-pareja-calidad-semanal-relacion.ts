export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function horasParejaCalidadSemanalRelacion(i: Inputs): Outputs {
  const n=Number(i.hijosNum)||0; const o=String(i.ocup||'med');
  const base=6; const extra=n*0.5+(o==='alta'?1:o==='med'?0:-1);
  const sem=Math.max(3,base-extra);
  return { semanal:`${sem.toFixed(1)}h`, diario:`${(sem*60/7).toFixed(0)} min`, cita:'1-2/mes', resumen:`Pareja con ${n} hijos: ${sem.toFixed(1)}h/semana, ${(sem*60/7).toFixed(0)}min/día.` };
}
