import { doughnut, largestLabel, money, n, positive, round } from './_ocio-costos';

export function vacacionesInviernoChicosArgentina(i: any) {
  const chicos = positive(i.chicos, 'la cantidad de chicos');
  const semanas = positive(i.semanas, 'las semanas de vacaciones');
  const coloniaTotal = chicos * semanas * n(i.coloniaSemana);
  const salidasTotal = chicos * semanas * n(i.salidasSemana) * n(i.costoSalida);
  const meriendasTotal = chicos * semanas * n(i.meriendasSemana) * n(i.costoMerienda);
  const transporteTotal = semanas * n(i.transporteSemana);
  const extrasTotal = n(i.extras);
  const total = coloniaTotal + salidasTotal + meriendasTotal + transporteTotal + extrasTotal;
  const parts = [
    { label: 'Colonia/talleres', value: coloniaTotal },
    { label: 'Salidas', value: salidasTotal },
    { label: 'Meriendas', value: meriendasTotal },
    { label: 'Transporte', value: transporteTotal },
    { label: 'Extras', value: extrasTotal },
  ];

  return {
    total: round(total),
    porChico: round(total / chicos),
    porSemana: round(total / semanas),
    coloniaTotal: round(coloniaTotal),
    salidasTotal: round(salidasTotal),
    _chart: doughnut(parts, total, 'Presupuesto de vacaciones de invierno con chicos'),
    _insight: {
      title: 'Presupuesto para el receso',
      text: `Para **${chicos} ${chicos === 1 ? 'chico' : 'chicos'}** durante **${semanas} ${semanas === 1 ? 'semana' : 'semanas'}** necesitás **${money(total)}**. Lo que más pesa es **${largestLabel(parts)}**.`,
      tone: total / chicos > 250000 ? 'warn' : 'neutral',
      icon: '❄️',
    },
  };
}
