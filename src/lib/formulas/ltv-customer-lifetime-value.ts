/** LTV (Customer Lifetime Value) y ratio LTV/CAC */
export interface Inputs {
  ticketPromedio: number;
  comprasPorAnio: number;
  vidaClienteAnios: number;
  margenBrutoPorcentaje?: number;
  cac?: number;
}
export interface Outputs {
  ltvIngresos: number;
  ltvMargen: number;
  ratio: number;
  payback: number;
  benchmark: string;
  resumen: string;
}

export function ltvCustomerLifetimeValue(i: Inputs): Outputs {
  const ticket = Number(i.ticketPromedio);
  const frec = Number(i.comprasPorAnio);
  const vida = Number(i.vidaClienteAnios);
  const margen = Number(i.margenBrutoPorcentaje) || 100;
  const cac = Number(i.cac) || 0;

  if (!ticket || ticket <= 0) throw new Error('Ingresá el ticket promedio');
  if (!frec || frec <= 0) throw new Error('Ingresá las compras por año');
  if (!vida || vida <= 0) throw new Error('Ingresá la vida del cliente en años');

  const ltvIngresos = ticket * frec * vida;
  const ltvMargen = ltvIngresos * (margen / 100);
  const ratio = cac > 0 ? ltvMargen / cac : 0;
  // Payback: meses para recuperar CAC
  const ingresoMensualConMargen = (ticket * frec * margen / 100) / 12;
  const payback = cac > 0 && ingresoMensualConMargen > 0 ? cac / ingresoMensualConMargen : 0;

  let benchmark = '';
  if (cac === 0) benchmark = 'Ingresá el CAC para ver el benchmark LTV/CAC.';
  else if (ratio >= 5) benchmark = 'Excelente — negocio muy escalable.';
  else if (ratio >= 3) benchmark = 'Saludable — estándar SaaS/ecommerce.';
  else if (ratio >= 2) benchmark = 'Aceptable pero mejorable.';
  else if (ratio >= 1) benchmark = 'Marginal — recuperás CAC pero no crecés.';
  else benchmark = 'Perdedor — gastás más de lo que cada cliente te deja.';

  const resumen = `Cada cliente genera ${Math.round(ltvIngresos).toLocaleString()} en ingresos de por vida (${Math.round(ltvMargen).toLocaleString()} de margen).`;

  return {
    ltvIngresos: Math.round(ltvIngresos),
    ltvMargen: Math.round(ltvMargen),
    ratio: Number(ratio.toFixed(2)),
    payback: Number(payback.toFixed(1)),
    benchmark,
    resumen,
  };
}
