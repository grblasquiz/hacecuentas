export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function asignacionNacimientoMatrimonioAdopcion(i: Inputs): Outputs {
  const t=String(i.tipo||'nac');
  const m: Record<string,number> = { nac:84478, ado:505070, pren:72474 };
  const req: Record<string,string> = { nac:'Hijo inscripto ANSES + partida', ado:'Sentencia judicial + inscripción', pren:'Desde 3er mes hasta nacimiento' };
  const nombre: Record<string,string> = { nac:'por nacimiento', ado:'por adopción', pren:'prenatal' };
  const monto = m[t]||0;
  const esPago = (t==='nac'||t==='ado');
  const _insight = {
    title: esPago ? 'Pago único' : 'Asignación mensual',
    text: esPago
      ? `La asignación ${nombre[t]||t} es un **pago único de $${monto.toLocaleString('es-AR')}** que ANSES abona una sola vez al cumplir los requisitos (${req[t]}).`
      : `La asignación ${nombre[t]||t} se cobra **mensualmente ($${monto.toLocaleString('es-AR')}/mes)** ${req[t]?.toLowerCase()}, no es un pago único.`,
    tone: 'neutral' as const,
    icon: t==='nac' ? '👶' : t==='ado' ? '🤝' : '🤰',
  };
  return { monto:'$'+monto.toLocaleString('es-AR'), requisitos:req[t]||'', resumen:`Asignación ${t}: $${monto.toLocaleString('es-AR')}.`, _insight };
}
