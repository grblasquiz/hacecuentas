/**
 * Calculadora de Cumple de 15 - Presupuesto.
 */
export interface PresupuestoCumple15QuinceaneraInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoCumple15QuinceaneraOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoSalon:number;
  costoComidaBebida:number;
  costoVestidoMake:number;
  costoFotoVideo:number;
  costoDjMusica:number;
  costoInvitacionesOtros:number;
}
export function presupuestoCumple15Quinceanera(inputs: PresupuestoCumple15QuinceaneraInputs): PresupuestoCumple15QuinceaneraOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 110;
  if (nivel === 'basico') costoPorInvitado = 50;
  else if (nivel === 'premium') costoPorInvitado = 250;
  const costoTotal = inv * costoPorInvitado;
  return {
    costoTotal,
    costoPorInvitado,
    costoSalon: Math.round(costoTotal * 0.3),
    costoComidaBebida: Math.round(costoTotal * 0.3),
    costoVestidoMake: Math.round(costoTotal * 0.12),
    costoFotoVideo: Math.round(costoTotal * 0.1),
    costoDjMusica: Math.round(costoTotal * 0.1),
    costoInvitacionesOtros: Math.round(costoTotal * 0.08),
  };
}
