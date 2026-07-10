import { money, n, positive, round } from './_ocio-costos';

export function diasVacacionesMeAlcanza(i: any) {
  const presupuesto = positive(i.presupuesto, 'tu presupuesto');
  const personas = positive(i.personas, 'la cantidad de personas');
  const gastoFijo = n(i.gastoFijo);
  const bufferPct = Math.min(Math.max(n(i.bufferPct, 10), 0), 80);
  const presupuestoUsable = Math.max(0, (presupuesto - gastoFijo) / (1 + bufferPct / 100));
  const gastoDia = personas * (n(i.comidaPersonaDia) + n(i.actividadesPersonaDia)) + n(i.transporteDia);
  const alojamientoNoche = n(i.alojamientoNoche);
  if (gastoDia + alojamientoNoche <= 0) throw new Error('Ingresá al menos alojamiento, comida, transporte o actividades');

  let dias = 0;
  let costo = 0;
  while (dias < 365) {
    const nextDias = dias + 1;
    const nextNoches = Math.max(0, nextDias - 1);
    const nextCosto = nextDias * gastoDia + nextNoches * alojamientoNoche;
    if (nextCosto > presupuestoUsable) break;
    dias = nextDias;
    costo = nextCosto;
  }
  const noches = Math.max(0, dias - 1);
  const totalConBuffer = costo * (1 + bufferPct / 100) + gastoFijo;
  const sobrante = Math.max(0, presupuesto - totalConBuffer);

  return {
    diasPosibles: dias,
    noches,
    gastoDiario: round(gastoDia),
    presupuestoUsable: round(presupuestoUsable),
    totalEstimado: round(totalConBuffer),
    sobrante: round(sobrante),
    _insight: {
      title: dias > 0 ? 'Tu presupuesto alcanza' : 'El presupuesto no alcanza para 1 día',
      text: dias > 0
        ? `Con **${money(presupuesto)}** te alcanzan **${dias} ${dias === 1 ? 'día' : 'días'}** (${noches} ${noches === 1 ? 'noche' : 'noches'}) para **${personas} ${personas === 1 ? 'persona' : 'personas'}**, dejando un colchón del **${bufferPct}%**.`
        : `Después del gasto fijo y el colchón del **${bufferPct}%**, no queda margen suficiente para cubrir el primer día con los costos cargados.`,
      tone: dias >= 5 ? 'positive' : 'warn',
      icon: '🧳',
    },
  };
}
