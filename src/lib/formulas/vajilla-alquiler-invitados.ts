/**
 * Calculadora de Vajilla para Alquiler - Invitados.
 */
export interface VajillaAlquilerInvitadosInputs { invitados:number; tipoComida:string; }
export interface VajillaAlquilerInvitadosOutputs { platos:number; copas:number; cubiertos:number; costoEstimado:number; _insight?:any; _chart?:any; }
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

  const totalPiezas = platos + copas + cubiertos;
  const tipoLabel = tipo === 'coctel' ? 'cóctel' : tipo === 'asado' ? 'asado' : tipo === 'buffet' ? 'buffet' : 'comida completa';
  const _insight = {
    title: 'Vajilla a alquilar',
    text: `Para **${inv} invitados** en formato ${tipoLabel} necesitás unas **${platos} piezas de platos**, **${copas} copas** y **${cubiertos} cubiertos** (incluye 10% de reserva por roturas), con un costo estimado de **$${costoEstimado.toLocaleString('es-AR')}**.`,
    tone: 'neutral',
    icon: '🍽️',
  };

  const slices = [
    { label: 'Platos', value: platos },
    { label: 'Copas', value: copas },
    { label: 'Cubiertos', value: cubiertos },
  ].filter(s => s.value > 0);
  const _chart = {
    type: 'doughnut',
    slices,
    centerValue: totalPiezas.toLocaleString('es-AR'),
    centerLabel: 'piezas',
    ariaLabel: `Distribución de la vajilla: ${platos} platos, ${copas} copas y ${cubiertos} cubiertos, total ${totalPiezas} piezas.`,
  };

  return { platos, copas, cubiertos, costoEstimado, _insight, _chart };
}
