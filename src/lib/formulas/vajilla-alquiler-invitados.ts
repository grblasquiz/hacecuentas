/**
 * Calculadora de Vajilla para Alquiler - Invitados.
 */
export interface VajillaAlquilerInvitadosInputs { invitados:number; tipoComida:string; }
export interface VajillaAlquilerInvitadosOutputs { platos:number; copas:number; cubiertos:number; costoEstimado:number; }
export function vajillaAlquilerInvitados(inputs: VajillaAlquilerInvitadosInputs): VajillaAlquilerInvitadosOutputs {
  const inv = Number(inputs.invitados);
  const tipo = inputs.tipoComida;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let platosPorInv = 3, copasPorInv = 4, cubiertosPorInv = 6;
  if (tipo === 'coctel') { platosPorInv = 2; copasPorInv = 3; cubiertosPorInv = 0; }
  else if (tipo === 'asado') { platosPorInv = 2; copasPorInv = 3; cubiertosPorInv = 2; }
  else if (tipo === 'buffet') { platosPorInv = 1.5; copasPorInv = 3; cubiertosPorInv = 3; }
  const reserva = 1.1;
  const platos = Math.ceil(inv * platosPorInv * reserva);
  const copas = Math.ceil(inv * copasPorInv * reserva);
  const cubiertos = Math.ceil(inv * cubiertosPorInv * reserva);
  const costoEstimado = Math.round((platos + copas + cubiertos) * 0.5);
  return { platos, copas, cubiertos, costoEstimado };
}
