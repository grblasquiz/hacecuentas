/**
 * Calculadora de Despedida de Soltera - Presupuesto.
 */
export interface PresupuestoDespedidaSolteraInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoDespedidaSolteraOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoViajeLocacion:number;
  costoComidaBebida:number;
  costoActividades:number;
  costoVestuarioDeco:number;
  costoRegalosSorpresa:number;
}
export function presupuestoDespedidaSoltera(inputs: PresupuestoDespedidaSolteraInputs): PresupuestoDespedidaSolteraOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 120;
  if (nivel === 'basico') costoPorInvitado = 40;
  else if (nivel === 'premium') costoPorInvitado = 300;
  const costoTotal = inv * costoPorInvitado;
  return {
    costoTotal,
    costoPorInvitado,
    costoViajeLocacion: Math.round(costoTotal * 0.4),
    costoComidaBebida: Math.round(costoTotal * 0.25),
    costoActividades: Math.round(costoTotal * 0.2),
    costoVestuarioDeco: Math.round(costoTotal * 0.1),
    costoRegalosSorpresa: Math.round(costoTotal * 0.05),
  };
}
