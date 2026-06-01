/** Tarifa por hora freelance considerando gastos, vacaciones e impuestos */
export interface Inputs {
  ingresoDeseadoMensual: number;
  horasFacturablesSemana: number;
  semanasVacaciones?: number;
  gastosFijosMensuales?: number;
  impuestosPorcentaje?: number;
}
export interface Outputs {
  tarifaHora: number;
  tarifaDia: number;
  horasFacturablesAnuales: number;
  ingresoBrutoAnual: number;
  ingresoNetoAnual: number;
  impuestosAnuales: number;
  resumen: string;
  _chart?: any;
  _insight?: any;
}

export function freelanceHourlyRate(i: Inputs): Outputs {
  const ingresoDeseado = Number(i.ingresoDeseadoMensual);
  const horasSem = Number(i.horasFacturablesSemana);
  const vac = Number(i.semanasVacaciones) || 4;
  const gastos = Number(i.gastosFijosMensuales) || 0;
  const imp = Number(i.impuestosPorcentaje) || 25;

  if (!ingresoDeseado || ingresoDeseado <= 0) throw new Error('Ingresá el ingreso neto mensual que querés');
  if (!horasSem || horasSem <= 0 || horasSem > 60) throw new Error('Las horas facturables por semana deben estar entre 1 y 60');
  if (vac < 0 || vac > 52) throw new Error('Las semanas de vacaciones deben estar entre 0 y 52');
  if (imp < 0 || imp >= 100) throw new Error('Los impuestos deben ser entre 0% y 99%');

  const semanasFacturables = 52 - vac;
  const horasAnuales = horasSem * semanasFacturables;
  const ingresoNetoAnual = (ingresoDeseado + gastos) * 12;
  // Brutear por impuestos: neto = bruto × (1 - imp%), bruto = neto / (1 - imp%)
  const ingresoBrutoAnual = ingresoNetoAnual / (1 - imp / 100);
  const tarifaHora = ingresoBrutoAnual / horasAnuales;
  const tarifaDia = tarifaHora * 8;
  const impuestosAnuales = ingresoBrutoAnual - ingresoNetoAnual;

  const resumen = `Tu tarifa debería ser ${tarifaHora.toFixed(2)}/hora para cobrar ${ingresoDeseado.toLocaleString()} netos al mes (${horasAnuales} horas facturables al año).`;

  // De cada hora facturada, cuánto se va en impuestos
  const impPorHora = tarifaHora * (imp / 100);
  const insightTone: 'good' | 'warn' | 'neutral' = imp >= 30 ? 'warn' : 'neutral';
  const insightText = imp >= 30
    ? `De cada hora a $${tarifaHora.toFixed(2)} se te van **$${impPorHora.toFixed(2)} en impuestos** (${imp}%): $${Math.round(impuestosAnuales).toLocaleString()}/año. Cobrar menos que esta tarifa significa trabajar gratis para el fisco.`
    : `Tu tarifa de $${tarifaHora.toFixed(2)}/hora ya tiene los impuestos adentro: $${impPorHora.toFixed(2)} por hora (${imp}%). El neto que te queda es **$${ingresoDeseado.toLocaleString()}/mes**; cobrar por debajo te lo come.`;

  const insight = {
    title: 'Qué te queda por hora',
    text: insightText,
    tone: insightTone,
    icon: '\u{1F4BC}',
  };

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto', value: Math.round(ingresoNetoAnual) },
      { label: 'Impuestos', value: Math.round(impuestosAnuales) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(ingresoBrutoAnual).toLocaleString('es-AR'),
    centerLabel: 'Bruto anual',
    ariaLabel: 'Composición del ingreso bruto anual freelance: neto que te queda vs impuestos',
  };

  return {
    tarifaHora: Number(tarifaHora.toFixed(2)),
    tarifaDia: Number(tarifaDia.toFixed(2)),
    horasFacturablesAnuales: Math.round(horasAnuales),
    ingresoBrutoAnual: Math.round(ingresoBrutoAnual),
    ingresoNetoAnual: Math.round(ingresoNetoAnual),
    impuestosAnuales: Math.round(impuestosAnuales),
    resumen,
    _chart: chart,
    _insight: insight,
  };
}
