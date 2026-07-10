import { doughnut, largestLabel, money, n, positive, round } from './_ocio-costos';

export function costoSalidaCanchaArgentina(i: any) {
  const personas = positive(i.personas, 'la cantidad de personas');
  const entradasTotal = personas * n(i.entradaPersona);
  const comidaTotal = personas * (n(i.comidaPersona) + n(i.bebidaPersona));
  const transporteTotal = personas * n(i.transportePersona) + n(i.estacionamiento);
  const extrasTotal = n(i.extras);
  const total = entradasTotal + comidaTotal + transporteTotal + extrasTotal;
  const parts = [
    { label: 'Entradas', value: entradasTotal },
    { label: 'Comida y bebida', value: comidaTotal },
    { label: 'Transporte', value: transporteTotal },
    { label: 'Extras', value: extrasTotal },
  ];

  return {
    total: round(total),
    porPersona: round(total / personas),
    entradasTotal: round(entradasTotal),
    comidaTotal: round(comidaTotal),
    transporteTotal: round(transporteTotal),
    _chart: doughnut(parts, total, 'Costo de una salida a la cancha'),
    _insight: {
      title: 'La cancha completa',
      text: `Ir a la cancha entre **${personas}** cuesta **${money(total)}**, unos **${money(total / personas)} por persona**. El rubro principal es **${largestLabel(parts)}**.`,
      tone: total / personas > 50000 ? 'warn' : 'neutral',
      icon: '🏟️',
    },
  };
}
