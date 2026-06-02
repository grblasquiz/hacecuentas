/**
 * Calculadora de Cumple de 15 - Presupuesto.
 */
export interface PresupuestoCumple15QuinceaneraInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoCumple15QuinceaneraOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoSalon:number;
  costoComidaBebida:number;
  costoVestidoMake:number;
  costoFotoVideo:number;
  costoDjMusica:number;
  costoInvitacionesOtros:number;
  _insight?: any;
  _chart?: any;
}
export function presupuestoCumple15Quinceanera(inputs: PresupuestoCumple15QuinceaneraInputs): PresupuestoCumple15QuinceaneraOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 110;
  if (nivel === 'basico') costoPorInvitado = 50;
  else if (nivel === 'premium') costoPorInvitado = 250;
  const costoTotal = inv * costoPorInvitado;
  const costoSalon = Math.round(costoTotal * 0.3);
  const costoComidaBebida = Math.round(costoTotal * 0.3);
  const costoVestidoMake = Math.round(costoTotal * 0.12);
  const costoFotoVideo = Math.round(costoTotal * 0.1);
  const costoDjMusica = Math.round(costoTotal * 0.1);
  const costoInvitacionesOtros = Math.round(costoTotal * 0.08);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const nivelLabel = nivel === 'basico' ? 'básico' : nivel === 'premium' ? 'premium' : 'estándar';
  const _insight = {
    title: 'Cuánto sale el cumple de 15',
    text: `Para **${fmt.format(inv)} invitados** en versión **${nivelLabel}**, la fiesta de 15 cuesta cerca de **$${fmt.format(costoTotal)}** (**$${fmt.format(costoPorInvitado)} por invitado**). Salón y comida se llevan el **60%**: recortar la lista de invitados es lo que más mueve el número final.`,
    tone: nivel === 'premium' ? 'warn' : 'neutral',
    icon: '🎉',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Salón', value: costoSalon },
      { label: 'Comida y bebida', value: costoComidaBebida },
      { label: 'Vestido y make-up', value: costoVestidoMake },
      { label: 'Foto y video', value: costoFotoVideo },
      { label: 'DJ / música', value: costoDjMusica },
      { label: 'Invitaciones y otros', value: costoInvitacionesOtros },
    ],
    prefix: '$',
    centerValue: `$${fmt.format(costoTotal)}`,
    centerLabel: 'Costo total',
    ariaLabel: `Distribución del costo del cumple de 15 por rubro, total $${fmt.format(costoTotal)}`,
  };

  return {
    costoTotal,
    costoPorInvitado,
    costoSalon,
    costoComidaBebida,
    costoVestidoMake,
    costoFotoVideo,
    costoDjMusica,
    costoInvitacionesOtros,
    _insight,
    _chart,
  };
}
