import { doughnut, largestLabel, money, n, positive, round } from './_ocio-costos';

export function costoCineFamiliaArgentina(i: any) {
  const adultos = n(i.adultos);
  const chicos = n(i.chicos);
  const personas = adultos + chicos;
  if (personas <= 0) throw new Error('Ingresá al menos una persona');

  const entradasTotal = adultos * n(i.entradaAdulto) + chicos * n(i.entradaChico);
  const comidaTotal = adultos * n(i.comboAdulto) + chicos * n(i.comboChico);
  const extrasTotal = n(i.transporte) + n(i.estacionamiento) + n(i.otros);
  const total = entradasTotal + comidaTotal + extrasTotal;
  const parts = [
    { label: 'Entradas', value: entradasTotal },
    { label: 'Pochoclo y bebidas', value: comidaTotal },
    { label: 'Transporte y extras', value: extrasTotal },
  ];

  return {
    total: round(total),
    porPersona: round(total / personas),
    entradasTotal: round(entradasTotal),
    comidaTotal: round(comidaTotal),
    extrasTotal: round(extrasTotal),
    _chart: doughnut(parts, total, 'Composición del costo de una salida al cine'),
    _insight: {
      title: 'Costo de la salida al cine',
      text: `La salida para **${personas} ${personas === 1 ? 'persona' : 'personas'}** cuesta **${money(total)}**, unos **${money(total / personas)} por persona**. El rubro que más pesa es **${largestLabel(parts)}**.`,
      tone: total / personas > 25000 ? 'warn' : 'neutral',
      icon: '🎬',
    },
  };
}
