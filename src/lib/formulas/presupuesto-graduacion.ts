/**
 * Calculadora de Fiesta de Graduación - Presupuesto.
 */
export interface PresupuestoGraduacionInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoGraduacionOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoSalonFiesta:number;
  costoViajeEgresados:number;
  costoVestuarioGraduacion:number;
  costoFotoVideo:number;
  costoAnuarioEgresados:number;
  costoOtros:number;
}
export function presupuestoGraduacion(inputs: PresupuestoGraduacionInputs): PresupuestoGraduacionOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 80;
  if (nivel === 'basico') costoPorInvitado = 35;
  else if (nivel === 'premium') costoPorInvitado = 180;
  const costoTotal = inv * costoPorInvitado;
  return {
    costoTotal,
    costoPorInvitado,
    costoSalonFiesta: Math.round(costoTotal * 0.4),
    costoViajeEgresados: Math.round(costoTotal * 0.25),
    costoVestuarioGraduacion: Math.round(costoTotal * 0.1),
    costoFotoVideo: Math.round(costoTotal * 0.1),
    costoAnuarioEgresados: Math.round(costoTotal * 0.08),
    costoOtros: Math.round(costoTotal * 0.07),
  };
}
