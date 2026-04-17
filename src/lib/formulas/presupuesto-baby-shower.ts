/**
 * Calculadora de Baby Shower - Presupuesto.
 */
export interface PresupuestoBabyShowerInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoBabyShowerOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoComidaBebida:number;
  costoDecoracion:number;
  costoJuegosActividades:number;
  costoTortaDulces:number;
  costoSouvenirs:number;
  costoOtros:number;
}
export function presupuestoBabyShower(inputs: PresupuestoBabyShowerInputs): PresupuestoBabyShowerOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 35;
  if (nivel === 'basico') costoPorInvitado = 15;
  else if (nivel === 'premium') costoPorInvitado = 75;
  const costoTotal = inv * costoPorInvitado;
  return {
    costoTotal,
    costoPorInvitado,
    costoComidaBebida: Math.round(costoTotal * 0.35),
    costoDecoracion: Math.round(costoTotal * 0.25),
    costoJuegosActividades: Math.round(costoTotal * 0.1),
    costoTortaDulces: Math.round(costoTotal * 0.15),
    costoSouvenirs: Math.round(costoTotal * 0.1),
    costoOtros: Math.round(costoTotal * 0.05),
  };
}
