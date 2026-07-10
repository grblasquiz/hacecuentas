import { doughnut, largestLabel, money, n, positive, round } from './_ocio-costos';

export function costoParqueDiversionesSalidaInfantil(i: any) {
  const adultos = n(i.adultos);
  const chicos = n(i.chicos);
  const personas = adultos + chicos;
  if (personas <= 0) throw new Error('Ingresá al menos una persona');
  const entradasTotal = adultos * n(i.entradaAdulto) + chicos * n(i.entradaChico);
  const juegosExtraTotal = chicos * n(i.juegosExtraChico);
  const comidaTotal = personas * n(i.comidaPersona);
  const transporteTotal = n(i.transporte) + n(i.estacionamiento);
  const extrasTotal = n(i.extras);
  const total = entradasTotal + juegosExtraTotal + comidaTotal + transporteTotal + extrasTotal;
  const parts = [
    { label: 'Entradas', value: entradasTotal },
    { label: 'Juegos extra', value: juegosExtraTotal },
    { label: 'Comida', value: comidaTotal },
    { label: 'Transporte', value: transporteTotal },
    { label: 'Extras', value: extrasTotal },
  ];

  return {
    total: round(total),
    porPersona: round(total / personas),
    porChico: chicos > 0 ? round(total / chicos) : 0,
    entradasTotal: round(entradasTotal),
    comidaTotal: round(comidaTotal),
    _chart: doughnut(parts, total, 'Costo de parque de diversiones o salida infantil'),
    _insight: {
      title: 'Salida infantil completa',
      text: `La salida cuesta **${money(total)}**, unos **${money(total / personas)} por persona**. El rubro principal es **${largestLabel(parts)}**.`,
      tone: total / personas > 50000 ? 'warn' : 'neutral',
      icon: '🎡',
    },
  };
}
