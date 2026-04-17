/**
 * Calculadora de Aniversario de Bodas - Presupuesto.
 */
export interface PresupuestoAniversarioBodasInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoAniversarioBodasOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoCenaCatering:number;
  costoDecoracionFlores:number;
  costoRenovacionVotos:number;
  costoFotoVideoAnos:number;
  costoRegaloEspecial:number;
  costoOtros:number;
}
export function presupuestoAniversarioBodas(inputs: PresupuestoAniversarioBodasInputs): PresupuestoAniversarioBodasOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 50;
  if (nivel === 'basico') costoPorInvitado = 20;
  else if (nivel === 'premium') costoPorInvitado = 120;
  const costoTotal = inv * costoPorInvitado;
  return {
    costoTotal,
    costoPorInvitado,
    costoCenaCatering: Math.round(costoTotal * 0.45),
    costoDecoracionFlores: Math.round(costoTotal * 0.2),
    costoRenovacionVotos: Math.round(costoTotal * 0.1),
    costoFotoVideoAnos: Math.round(costoTotal * 0.1),
    costoRegaloEspecial: Math.round(costoTotal * 0.1),
    costoOtros: Math.round(costoTotal * 0.05),
  };
}
