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
  _insight?: any;
  _chart?: any;
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

  let insightText: string;
  let tone: 'good' | 'warn' | 'neutral';
  if (cac <= 0) {
    insightText = `Cada cliente deja **${Math.round(ltvMargen).toLocaleString()}** de margen a lo largo de su vida (**${Math.round(ltvIngresos).toLocaleString()}** en ingresos). Cargá el CAC para saber si lo recuperás y en cuántos meses.`;
    tone = 'neutral';
  } else {
    insightText = `Con un LTV de margen de **${Math.round(ltvMargen).toLocaleString()}** y un CAC de **${Math.round(cac).toLocaleString()}**, tu ratio LTV/CAC es **${ratio.toFixed(2)}x** y recuperás la inversión en **${payback.toFixed(1)} meses**. ${benchmark}`;
    tone = ratio >= 3 ? 'good' : ratio >= 2 ? 'neutral' : 'warn';
  }
  const _insight = {
    title: cac > 0 ? 'Tu economía por cliente' : 'Valor por cliente',
    text: insightText,
    tone,
    icon: '💰',
  };

  const out: Outputs = {
    ltvIngresos: Math.round(ltvIngresos),
    ltvMargen: Math.round(ltvMargen),
    ratio: Number(ratio.toFixed(2)),
    payback: Number(payback.toFixed(1)),
    benchmark,
    resumen,
    _insight,
  };

  if (cac > 0) {
    out._chart = {
      type: 'scale' as const,
      marker: Math.min(ratio, 6),
      markerLabel: ratio.toFixed(2) + 'x',
      min: 0,
      segments: [
        { nombre: 'Perdedor', max: 1, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Marginal', max: 2, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Aceptable', max: 3, color: '#fbbf24', colorDark: '#ca8a04' },
        { nombre: 'Saludable', max: 5, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: 'Excelente', max: 6, color: '#22c55e', colorDark: '#16a34a' },
      ],
      ariaLabel: `Ratio LTV/CAC de ${ratio.toFixed(2)}x en la escala de salud del negocio, de perdedor a excelente.`,
    };
  }

  return out;
}
