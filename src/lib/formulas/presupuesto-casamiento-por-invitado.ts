/**
 * Calculadora de Presupuesto Casamiento por Invitado.
 */
export interface PresupuestoCasamientoPorInvitadoInputs { invitados:number; nivel:string; }
export interface PresupuestoCasamientoPorInvitadoOutputs {
  costoTotal:number; costoPorInvitado:number; costoSalon:number;
  costoComidaBebida:number; costoVestuario:number; costoFotoVideo:number;
  costoMusicaDj:number; costoOtros:number;
  _insight?: any; _chart?: any;
}
export function presupuestoCasamientoPorInvitado(inputs: PresupuestoCasamientoPorInvitadoInputs): PresupuestoCasamientoPorInvitadoOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 150;
  if (nivel === 'basico') costoPorInvitado = 70;
  else if (nivel === 'premium') costoPorInvitado = 350;
  const costoTotal = inv * costoPorInvitado;
  const costoSalon = Math.round(costoTotal * 0.35);
  const costoComidaBebida = Math.round(costoTotal * 0.30);
  const costoVestuario = Math.round(costoTotal * 0.10);
  const costoFotoVideo = Math.round(costoTotal * 0.10);
  const costoMusicaDj = Math.round(costoTotal * 0.08);
  const costoOtros = Math.round(costoTotal * 0.07);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const nivelLabel = nivel === 'basico' ? 'básico' : nivel === 'premium' ? 'premium' : 'estándar';
  const _insight = {
    title: 'Tu casamiento en números',
    text: `Con **${fmt.format(inv)} invitados** a nivel **${nivelLabel}**, el casamiento ronda los **$${fmt.format(costoTotal)}** (unos **$${fmt.format(costoPorInvitado)} por invitado**). El salón y la comida/bebida se llevan el **65%** del total: ahí está la palanca real para ajustar el presupuesto.`,
    tone: nivel === 'premium' ? 'warn' : 'neutral',
    icon: '💍',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Salón', value: costoSalon },
      { label: 'Comida y bebida', value: costoComidaBebida },
      { label: 'Vestuario', value: costoVestuario },
      { label: 'Foto y video', value: costoFotoVideo },
      { label: 'Música / DJ', value: costoMusicaDj },
      { label: 'Otros', value: costoOtros },
    ],
    prefix: '$',
    centerValue: `$${fmt.format(costoTotal)}`,
    centerLabel: 'Costo total',
    ariaLabel: `Distribución del costo del casamiento por rubro, total $${fmt.format(costoTotal)}`,
  };

  return {
    costoTotal,
    costoPorInvitado,
    costoSalon,
    costoComidaBebida,
    costoVestuario,
    costoFotoVideo,
    costoMusicaDj,
    costoOtros,
    _insight,
    _chart,
  };
}
