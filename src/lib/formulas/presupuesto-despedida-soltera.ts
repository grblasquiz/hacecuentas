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
  _insight?: any;
  _chart?: any;
}
export function presupuestoDespedidaSoltera(inputs: PresupuestoDespedidaSolteraInputs): PresupuestoDespedidaSolteraOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 120;
  if (nivel === 'basico') costoPorInvitado = 40;
  else if (nivel === 'premium') costoPorInvitado = 300;
  const costoTotal = inv * costoPorInvitado;
  const costoViajeLocacion = Math.round(costoTotal * 0.4);
  const costoComidaBebida = Math.round(costoTotal * 0.25);
  const costoActividades = Math.round(costoTotal * 0.2);
  const costoVestuarioDeco = Math.round(costoTotal * 0.1);
  const costoRegalosSorpresa = Math.round(costoTotal * 0.05);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const nivelLabel = nivel === 'basico' ? 'básico' : nivel === 'premium' ? 'premium' : 'estándar';
  const _insight = {
    title: 'El presupuesto de la despedida',
    text: `Entre **${fmt.format(inv)} amigas** y un plan **${nivelLabel}**, la despedida sale cerca de **$${fmt.format(costoTotal)}** en total, **$${fmt.format(costoPorInvitado)} por persona**. El viaje/locación se lleva el rubro más grande (**40%**): si lo hacen cerca, baja muchísimo el costo por cabeza.`,
    tone: nivel === 'premium' ? 'warn' : 'neutral',
    icon: '👰',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Viaje / locación', value: costoViajeLocacion },
      { label: 'Comida y bebida', value: costoComidaBebida },
      { label: 'Actividades', value: costoActividades },
      { label: 'Vestuario y deco', value: costoVestuarioDeco },
      { label: 'Regalos / sorpresa', value: costoRegalosSorpresa },
    ],
    prefix: '$',
    centerValue: `$${fmt.format(costoTotal)}`,
    centerLabel: 'Costo total',
    ariaLabel: `Distribución del costo de la despedida de soltera por rubro, total $${fmt.format(costoTotal)}`,
  };

  return {
    costoTotal,
    costoPorInvitado,
    costoViajeLocacion,
    costoComidaBebida,
    costoActividades,
    costoVestuarioDeco,
    costoRegalosSorpresa,
    _insight,
    _chart,
  };
}
