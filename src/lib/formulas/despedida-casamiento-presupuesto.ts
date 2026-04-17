/**
 * Calculadora de Despedida de Casamiento - Presupuesto.
 */
export interface DespedidaCasamientoPresupuestoInputs { invitados:number; duracionDias:number; tipoFormato:string; }
export interface DespedidaCasamientoPresupuestoOutputs { costoTotal:number; costoPorInvitado:number; costoMadrinaExtra:number; checklist:string; }
export function despedidaCasamientoPresupuesto(inputs: DespedidaCasamientoPresupuestoInputs): DespedidaCasamientoPresupuestoOutputs {
  const inv = Number(inputs.invitados);
  const dias = Number(inputs.duracionDias);
  const formato = inputs.tipoFormato;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  if (!dias || dias <= 0) throw new Error('Ingresá duración');
  let costoPorInvitadoDia = 150;
  if (formato === 'cena') costoPorInvitadoDia = 60;
  else if (formato === 'viajeCorto') costoPorInvitadoDia = 110;
  else if (formato === 'viajeLargo') costoPorInvitadoDia = 180;
  const costoPorInvitado = costoPorInvitadoDia * dias;
  const costoTotal = costoPorInvitado * inv;
  const costoMadrinaExtra = Math.round(costoPorInvitado * 1.18);
  const checklist = '3 meses: reservar lugar + WhatsApp grupo. 2 meses: contratar actividades + recaudar 50%. 1 mes: confirmar menu. 1 semana: asistentes finales + plan B lluvia.';
  return {
    costoTotal,
    costoPorInvitado: Math.round(costoPorInvitado),
    costoMadrinaExtra,
    checklist,
  };
}
