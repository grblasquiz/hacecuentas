/**
 * Calculadora de Bautismo / Comunión - Presupuesto.
 */
export interface PresupuestoBautismoComunionInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoBautismoComunionOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoSalonCatering:number;
  costoIglesiaCeremonia:number;
  costoVestuario:number;
  costoFotoVideo:number;
  costoTortaMesaDulce:number;
  costoDecoracionOtros:number;
}
export function presupuestoBautismoComunion(inputs: PresupuestoBautismoComunionInputs): PresupuestoBautismoComunionOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 55;
  if (nivel === 'basico') costoPorInvitado = 25;
  else if (nivel === 'premium') costoPorInvitado = 130;
  const costoTotal = inv * costoPorInvitado;
  return {
    costoTotal,
    costoPorInvitado,
    costoSalonCatering: Math.round(costoTotal * 0.45),
    costoIglesiaCeremonia: Math.round(costoTotal * 0.1),
    costoVestuario: Math.round(costoTotal * 0.12),
    costoFotoVideo: Math.round(costoTotal * 0.12),
    costoTortaMesaDulce: Math.round(costoTotal * 0.1),
    costoDecoracionOtros: Math.round(costoTotal * 0.11),
  };
}
