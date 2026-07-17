import { doughnut, largestLabel, money, n, positive, round } from './_ocio-costos';

export function costoPreviaBolicheArgentina(i: any) {
  const personas = positive(i.personas, 'la cantidad de personas');
  const previaTotal = n(i.alcoholPreviaTotal) + n(i.picadaPreviaTotal);
  const entradasTotal = personas * n(i.entradaPersona);
  const adentroTotal = personas * n(i.consumicionesPersona);
  const transporteTotal = n(i.transporteTotal);
  const extrasTotal = n(i.extras);
  const total = previaTotal + entradasTotal + adentroTotal + transporteTotal + extrasTotal;
  const parts = [
    { label: 'Previa', value: previaTotal },
    { label: 'Entradas', value: entradasTotal },
    { label: 'Adentro', value: adentroTotal },
    { label: 'Transporte', value: transporteTotal },
    { label: 'Extras', value: extrasTotal },
  ];

  return {
    total: round(total),
    porPersona: round(total / personas),
    previaTotal: round(previaTotal),
    entradasTotal: round(entradasTotal),
    transporteTotal: round(transporteTotal),
    _chart: doughnut(parts, total, 'Costo de previa y boliche'),
    _insight: {
      title: 'Noche completa',
      text: `La salida completa cuesta **${money(total)}**, o **${money(total / personas)} por persona**. Lo más grande del presupuesto es **${largestLabel(parts)}**.`,
      tone: total / personas > 60000 ? 'warn' : 'neutral',
      icon: '🪩',
    },
  };
}
