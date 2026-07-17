import { doughnut, money, n, positive, round } from './_ocio-costos';

export function costoColoniaVacacionesArgentina(i: any) {
  const chicos = positive(i.chicos, 'la cantidad de chicos');
  const semanas = positive(i.semanas, 'las semanas');
  const base = chicos * semanas * n(i.costoSemanal);
  const extrasSemanales = chicos * semanas * (n(i.jornadaExtendidaSemana) + n(i.comedorSemana) + n(i.transporteSemana));
  const matricula = chicos * n(i.matriculaMateriales);
  const subtotal = base + extrasSemanales + matricula;
  const descuento = subtotal * Math.min(Math.max(n(i.descuentoHermanos), 0), 100) / 100;
  const total = subtotal - descuento;
  const extrasTotal = extrasSemanales + matricula;

  return {
    total: round(total),
    subtotal: round(subtotal),
    descuento: round(descuento),
    porChicoSemana: round(total / chicos / semanas),
    extrasTotal: round(extrasTotal),
    _chart: doughnut([
      { label: 'Cuota base', value: base },
      { label: 'Extras', value: extrasTotal },
      { label: 'Descuento', value: -descuento },
    ].filter((s) => s.value > 0), total, 'Costo de colonia de vacaciones'),
    _insight: {
      title: 'Costo real de la colonia',
      text: `La colonia cuesta **${money(total)}** en total, o **${money(total / chicos / semanas)} por chico por semana**. Los extras suman **${money(extrasTotal)}** antes de descuentos.`,
      tone: total / chicos / semanas > 150000 ? 'warn' : 'neutral',
      icon: '🏕️',
    },
  };
}
