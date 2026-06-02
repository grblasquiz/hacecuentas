/**
 * Calculadora de Baby Shower - Presupuesto.
 */
export interface PresupuestoBabyShowerInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoBabyShowerOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoComidaBebida:number;
  costoDecoracion:number;
  costoJuegosActividades:number;
  costoTortaDulces:number;
  costoSouvenirs:number;
  costoOtros:number;
  _insight?: any;
  _chart?: any;
}
export function presupuestoBabyShower(inputs: PresupuestoBabyShowerInputs): PresupuestoBabyShowerOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 35;
  if (nivel === 'basico') costoPorInvitado = 15;
  else if (nivel === 'premium') costoPorInvitado = 75;
  const costoTotal = inv * costoPorInvitado;
  const comida = Math.round(costoTotal * 0.35);
  const deco = Math.round(costoTotal * 0.25);
  const juegos = Math.round(costoTotal * 0.1);
  const torta = Math.round(costoTotal * 0.15);
  const souvenirs = Math.round(costoTotal * 0.1);
  const otros = Math.round(costoTotal * 0.05);
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const nivelTxt = nivel === 'basico' ? 'básico' : nivel === 'premium' ? 'premium' : 'estándar';
  const _insight = {
    title: 'Presupuesto del baby shower',
    text: `Para **${inv} invitados** con nivel ${nivelTxt} (${fmt(costoPorInvitado)} por persona) vas a necesitar unos **${fmt(costoTotal)}**. Comida y bebida es el rubro más pesado: **${fmt(comida)}** (35%).`,
    tone: 'neutral',
    icon: '🍼',
  };
  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Comida y bebida', value: comida },
      { label: 'Decoración', value: deco },
      { label: 'Juegos y actividades', value: juegos },
      { label: 'Torta y dulces', value: torta },
      { label: 'Souvenirs', value: souvenirs },
      { label: 'Otros', value: otros },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmt(comida + deco + juegos + torta + souvenirs + otros),
    centerLabel: 'Costo total',
    ariaLabel: 'Distribución del presupuesto del baby shower por rubro: comida, decoración, juegos, torta, souvenirs y otros.',
  };
  return {
    costoTotal,
    costoPorInvitado,
    costoComidaBebida: comida,
    costoDecoracion: deco,
    costoJuegosActividades: juegos,
    costoTortaDulces: torta,
    costoSouvenirs: souvenirs,
    costoOtros: otros,
    _insight,
    _chart,
  };
}
