/**
 * Calculadora de Snacks por Invitado - Juntada.
 */
export interface SnacksPorInvitadoJuntadaInputs { invitados:number; horas:number; }
export interface SnacksPorInvitadoJuntadaOutputs { kgSnacks:number; paquetes200g:number; gramosPorPersona:number; costoEstimado:number; }
export function snacksPorInvitadoJuntada(inputs: SnacksPorInvitadoJuntadaInputs): SnacksPorInvitadoJuntadaOutputs {
  const inv = Number(inputs.invitados);
  const horas = Number(inputs.horas);
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  if (!horas || horas <= 0) throw new Error('Ingresá duración');
  let gramos = 100;
  if (horas <= 2) gramos = 60;
  else if (horas >= 5) gramos = 150;
  const kgSnacks = (inv * gramos) / 1000;
  const paquetes200g = Math.ceil(kgSnacks / 0.2);
  return {
    kgSnacks: Number(kgSnacks.toFixed(2)),
    paquetes200g,
    gramosPorPersona: gramos,
    costoEstimado: Number((paquetes200g * 2.5).toFixed(0)),
  };
}
