export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function asignacionNacimientoMatrimonioAdopcion(i: Inputs): Outputs {
  const t=String(i.tipo||'nac');
  const m: Record<string,number> = { nac:80000, ado:480000, pren:65000 };
  const req: Record<string,string> = { nac:'Hijo inscripto ANSES + partida', ado:'Sentencia judicial + inscripción', pren:'Desde 3er mes hasta nacimiento' };
  return { monto:'$'+(m[t]||0).toLocaleString('es-AR'), requisitos:req[t]||'', resumen:`Asignación ${t}: $${(m[t]||0).toLocaleString('es-AR')}.` };
}
