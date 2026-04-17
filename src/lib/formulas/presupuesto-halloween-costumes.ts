/**
 * Calculadora de Fiesta de Halloween - Presupuesto.
 */
export interface PresupuestoHalloweenCostumesInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoHalloweenCostumesOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoDecoracion:number;
  costoComidaBebida:number;
  costoDisfracesMaquillaje:number;
  costoDulcesTrickTreat:number;
  costoMusicaShow:number;
}
export function presupuestoHalloweenCostumes(inputs: PresupuestoHalloweenCostumesInputs): PresupuestoHalloweenCostumesOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 35;
  if (nivel === 'basico') costoPorInvitado = 15;
  else if (nivel === 'premium') costoPorInvitado = 80;
  const costoTotal = inv * costoPorInvitado;
  return {
    costoTotal,
    costoPorInvitado,
    costoDecoracion: Math.round(costoTotal * 0.3),
    costoComidaBebida: Math.round(costoTotal * 0.3),
    costoDisfracesMaquillaje: Math.round(costoTotal * 0.2),
    costoDulcesTrickTreat: Math.round(costoTotal * 0.1),
    costoMusicaShow: Math.round(costoTotal * 0.1),
  };
}
