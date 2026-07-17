import { doughnut, largestLabel, money, n, positive, round } from './_ocio-costos';

export function costoBalnearioPlayaArgentina(i: any) {
  const personas = positive(i.personas, 'la cantidad de personas');
  const dias = positive(i.dias, 'los días');
  const carpaTotal = dias * n(i.carpaSombrillaDia);
  const estacionamientoTotal = dias * n(i.estacionamientoDia);
  const comidaTotal = personas * dias * n(i.comidaPersonaDia);
  const actividadesTotal = dias * n(i.actividadesDia);
  const viajeTotal = n(i.naftaPeajes);
  const extrasTotal = n(i.extras);
  const total = carpaTotal + estacionamientoTotal + comidaTotal + actividadesTotal + viajeTotal + extrasTotal;
  const parts = [
    { label: 'Carpa/sombrilla', value: carpaTotal },
    { label: 'Comida', value: comidaTotal },
    { label: 'Estacionamiento', value: estacionamientoTotal },
    { label: 'Viaje', value: viajeTotal },
    { label: 'Actividades', value: actividadesTotal },
    { label: 'Extras', value: extrasTotal },
  ];

  return {
    total: round(total),
    porPersona: round(total / personas),
    porDia: round(total / dias),
    carpaTotal: round(carpaTotal),
    comidaTotal: round(comidaTotal),
    _chart: doughnut(parts, total, 'Costo de balneario o día de playa'),
    _insight: {
      title: 'Día de playa completo',
      text: `Para **${personas}** durante **${dias} ${dias === 1 ? 'día' : 'días'}** el total es **${money(total)}**. El rubro dominante es **${largestLabel(parts)}**.`,
      tone: total / personas / dias > 40000 ? 'warn' : 'neutral',
      icon: '🏖️',
    },
  };
}
