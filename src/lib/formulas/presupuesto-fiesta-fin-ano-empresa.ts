/**
 * Calculadora de Fiesta de Fin de Año Empresa - Presupuesto.
 */
export interface PresupuestoFiestaFinAnoEmpresaInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoFiestaFinAnoEmpresaOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoSalonCatering:number;
  costoShowAnimacion:number;
  costoFotoVideo:number;
  costoRegalosSorteos:number;
  costoDecoracion:number;
}
export function presupuestoFiestaFinAnoEmpresa(inputs: PresupuestoFiestaFinAnoEmpresaInputs): PresupuestoFiestaFinAnoEmpresaOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 100;
  if (nivel === 'basico') costoPorInvitado = 50;
  else if (nivel === 'premium') costoPorInvitado = 220;
  const costoTotal = inv * costoPorInvitado;
  return {
    costoTotal,
    costoPorInvitado,
    costoSalonCatering: Math.round(costoTotal * 0.5),
    costoShowAnimacion: Math.round(costoTotal * 0.15),
    costoFotoVideo: Math.round(costoTotal * 0.1),
    costoRegalosSorteos: Math.round(costoTotal * 0.15),
    costoDecoracion: Math.round(costoTotal * 0.1),
  };
}
