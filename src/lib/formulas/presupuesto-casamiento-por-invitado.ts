/**
 * Calculadora de Presupuesto Casamiento por Invitado.
 */
export interface PresupuestoCasamientoPorInvitadoInputs { invitados:number; nivel:string; }
export interface PresupuestoCasamientoPorInvitadoOutputs {
  costoTotal:number; costoPorInvitado:number; costoSalon:number;
  costoComidaBebida:number; costoVestuario:number; costoFotoVideo:number;
  costoMusicaDj:number; costoOtros:number;
}
export function presupuestoCasamientoPorInvitado(inputs: PresupuestoCasamientoPorInvitadoInputs): PresupuestoCasamientoPorInvitadoOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 150;
  if (nivel === 'basico') costoPorInvitado = 70;
  else if (nivel === 'premium') costoPorInvitado = 350;
  const costoTotal = inv * costoPorInvitado;
  return {
    costoTotal,
    costoPorInvitado,
    costoSalon: Math.round(costoTotal * 0.35),
    costoComidaBebida: Math.round(costoTotal * 0.30),
    costoVestuario: Math.round(costoTotal * 0.10),
    costoFotoVideo: Math.round(costoTotal * 0.10),
    costoMusicaDj: Math.round(costoTotal * 0.08),
    costoOtros: Math.round(costoTotal * 0.07),
  };
}
