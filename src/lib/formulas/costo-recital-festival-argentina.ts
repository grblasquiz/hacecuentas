import { doughnut, largestLabel, money, n, positive, round } from './_ocio-costos';

export function costoRecitalFestivalArgentina(i: any) {
  const personas = positive(i.personas, 'la cantidad de personas');
  const noches = Math.max(0, n(i.noches));
  const entradasBase = personas * n(i.entradaPersona);
  const service = entradasBase * Math.min(Math.max(n(i.serviceChargePct), 0), 100) / 100;
  const entradasTotal = entradasBase + service;
  const consumoTotal = personas * n(i.comidaBebidaPersona);
  const transporteTotal = personas * n(i.transportePersona);
  const alojamientoTotal = noches * n(i.alojamientoNoche);
  const merchTotal = personas * n(i.merchPersona);
  const extrasTotal = n(i.extras);
  const total = entradasTotal + consumoTotal + transporteTotal + alojamientoTotal + merchTotal + extrasTotal;
  const parts = [
    { label: 'Entradas + cargo', value: entradasTotal },
    { label: 'Comida/bebida', value: consumoTotal },
    { label: 'Transporte', value: transporteTotal },
    { label: 'Alojamiento', value: alojamientoTotal },
    { label: 'Merch', value: merchTotal },
    { label: 'Extras', value: extrasTotal },
  ];

  return {
    total: round(total),
    porPersona: round(total / personas),
    entradasTotal: round(entradasTotal),
    serviceCharge: round(service),
    alojamientoTotal: round(alojamientoTotal),
    _chart: doughnut(parts, total, 'Costo de recital o festival'),
    _insight: {
      title: 'Recital sin sorpresa',
      text: `El plan completo cuesta **${money(total)}**, o **${money(total / personas)} por persona**. El rubro que manda es **${largestLabel(parts)}**.`,
      tone: total / personas > 150000 ? 'warn' : 'neutral',
      icon: '🎤',
    },
  };
}
