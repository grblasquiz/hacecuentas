/**
 * Calculadora de Cumple Infantil - Presupuesto.
 */
export interface PresupuestoCumpleInfantilInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoCumpleInfantilOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoSalonAnimacion:number;
  costoComidaBebida:number;
  costoTortaDulces:number;
  costoDecoracionTematica:number;
  costoSouvenirs:number;
  costoFotoVideo:number;
}
export function presupuestoCumpleInfantil(inputs: PresupuestoCumpleInfantilInputs): PresupuestoCumpleInfantilOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 30;
  if (nivel === 'basico') costoPorInvitado = 12;
  else if (nivel === 'premium') costoPorInvitado = 80;
  const costoTotal = inv * costoPorInvitado;
  return {
    costoTotal,
    costoPorInvitado,
    costoSalonAnimacion: Math.round(costoTotal * 0.35),
    costoComidaBebida: Math.round(costoTotal * 0.25),
    costoTortaDulces: Math.round(costoTotal * 0.15),
    costoDecoracionTematica: Math.round(costoTotal * 0.15),
    costoSouvenirs: Math.round(costoTotal * 0.07),
    costoFotoVideo: Math.round(costoTotal * 0.03),
  };
}
