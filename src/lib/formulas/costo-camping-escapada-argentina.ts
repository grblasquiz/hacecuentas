import { doughnut, largestLabel, money, n, positive, round } from './_ocio-costos';

export function costoCampingEscapadaArgentina(i: any) {
  const personas = positive(i.personas, 'la cantidad de personas');
  const noches = positive(i.noches, 'las noches');
  const dias = Math.max(noches + 1, n(i.dias, noches + 1));
  const campingTotal = personas * noches * n(i.campingPersonaNoche);
  const comidaTotal = personas * dias * n(i.comidaPersonaDia);
  const viajeTotal = n(i.naftaPeajes);
  const equipoTotal = n(i.alquilerEquipo) + n(i.compraEquipo);
  const extrasTotal = n(i.extras);
  const total = campingTotal + comidaTotal + viajeTotal + equipoTotal + extrasTotal;
  const parts = [
    { label: 'Camping', value: campingTotal },
    { label: 'Comida', value: comidaTotal },
    { label: 'Viaje', value: viajeTotal },
    { label: 'Equipo', value: equipoTotal },
    { label: 'Extras', value: extrasTotal },
  ];

  return {
    total: round(total),
    porPersona: round(total / personas),
    porDia: round(total / dias),
    campingTotal: round(campingTotal),
    comidaTotal: round(comidaTotal),
    _chart: doughnut(parts, total, 'Costo de camping o escapada barata'),
    _insight: {
      title: 'Escapada en modo camping',
      text: `La escapada de **${noches} ${noches === 1 ? 'noche' : 'noches'}** cuesta **${money(total)}**, unos **${money(total / personas)} por persona**. El rubro que más pesa es **${largestLabel(parts)}**.`,
      tone: total / personas > 250000 ? 'warn' : 'neutral',
      icon: '⛺',
    },
  };
}
