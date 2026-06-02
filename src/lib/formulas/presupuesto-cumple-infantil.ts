/**
 * Calculadora de Cumple Infantil - Presupuesto.
 */
export interface PresupuestoCumpleInfantilInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoCumpleInfantilOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoSalonAnimacion:number;
  costoComidaBebida:number;
  costoTortaDulces:number;
  costoDecoracionTematica:number;
  costoSouvenirs:number;
  costoFotoVideo:number;
  _insight?: any;
  _chart?: any;
}
export function presupuestoCumpleInfantil(inputs: PresupuestoCumpleInfantilInputs): PresupuestoCumpleInfantilOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 30;
  if (nivel === 'basico') costoPorInvitado = 12;
  else if (nivel === 'premium') costoPorInvitado = 80;
  const costoTotal = inv * costoPorInvitado;
  const costoSalonAnimacion = Math.round(costoTotal * 0.35);
  const costoComidaBebida = Math.round(costoTotal * 0.25);
  const costoTortaDulces = Math.round(costoTotal * 0.15);
  const costoDecoracionTematica = Math.round(costoTotal * 0.15);
  const costoSouvenirs = Math.round(costoTotal * 0.07);
  const costoFotoVideo = Math.round(costoTotal * 0.03);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const nivelLabel = nivel === 'basico' ? 'básico' : nivel === 'premium' ? 'premium' : 'estándar';
  const _insight = {
    title: 'El cumple infantil, ítem por ítem',
    text: `Con **${fmt.format(inv)} chicos** invitados en plan **${nivelLabel}**, el cumple sale alrededor de **$${fmt.format(costoTotal)}** (**$${fmt.format(costoPorInvitado)} por nene**). Salón/animación y comida concentran el **60%**: hacerlo en casa en lugar de un salón es el ahorro más grande.`,
    tone: nivel === 'premium' ? 'warn' : 'neutral',
    icon: '🎈',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Salón / animación', value: costoSalonAnimacion },
      { label: 'Comida y bebida', value: costoComidaBebida },
      { label: 'Torta y dulces', value: costoTortaDulces },
      { label: 'Decoración temática', value: costoDecoracionTematica },
      { label: 'Souvenirs', value: costoSouvenirs },
      { label: 'Foto y video', value: costoFotoVideo },
    ],
    prefix: '$',
    centerValue: `$${fmt.format(costoTotal)}`,
    centerLabel: 'Costo total',
    ariaLabel: `Distribución del costo del cumple infantil por rubro, total $${fmt.format(costoTotal)}`,
  };

  return {
    costoTotal,
    costoPorInvitado,
    costoSalonAnimacion,
    costoComidaBebida,
    costoTortaDulces,
    costoDecoracionTematica,
    costoSouvenirs,
    costoFotoVideo,
    _insight,
    _chart,
  };
}
