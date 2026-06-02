/** Gross margin vs Net margin vs EBITDA margin */
export interface Inputs {
  ingresos: number;
  costoVentas: number; // COGS
  gastosOperativos: number; // opex (sin depreciación/amortización)
  depreciacionAmortizacion?: number;
  interesesImpuestos?: number;
}
export interface Outputs {
  gananciaBruta: number;
  margenBruto: number;
  ebitda: number;
  margenEbitda: number;
  gananciaOperativa: number;
  margenOperativo: number;
  gananciaNeta: number;
  margenNeto: number;
  resumen: string;
  _chart?: any;
  _insight?: any;
}

export function grossMarginVsNet(i: Inputs): Outputs {
  const ingresos = Number(i.ingresos);
  const cogs = Number(i.costoVentas);
  const opex = Number(i.gastosOperativos) || 0;
  const da = Number(i.depreciacionAmortizacion) || 0;
  const ii = Number(i.interesesImpuestos) || 0;

  if (!ingresos || ingresos <= 0) throw new Error('Ingresá los ingresos');
  if (cogs < 0) throw new Error('El costo de ventas no puede ser negativo');
  if (cogs > ingresos) throw new Error('El costo de ventas no puede ser mayor a los ingresos');

  const gananciaBruta = ingresos - cogs;
  const ebitda = gananciaBruta - opex;
  const gananciaOperativa = ebitda - da;
  const gananciaNeta = gananciaOperativa - ii;

  const margenBruto = (gananciaBruta / ingresos) * 100;
  const margenEbitda = (ebitda / ingresos) * 100;
  const margenOperativo = (gananciaOperativa / ingresos) * 100;
  const margenNeto = (gananciaNeta / ingresos) * 100;

  const resumen = `Margen bruto: ${margenBruto.toFixed(1)}%. EBITDA: ${margenEbitda.toFixed(1)}%. Neto: ${margenNeto.toFixed(1)}%.`;

  // Descomposición de los ingresos en sus componentes (suman el total de ingresos)
  const slices = [
    { label: 'Costo de ventas', value: cogs },
    { label: 'Gastos operativos', value: opex },
    { label: 'Deprec. y amort.', value: da },
    { label: 'Intereses e impuestos', value: ii },
    { label: 'Ganancia neta', value: Math.max(0, gananciaNeta) },
  ].filter((s) => s.value > 0);
  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: '$' + Math.round(ingresos).toLocaleString('es-AR'),
    centerLabel: 'Ingresos',
    ariaLabel: 'Composición de los ingresos: costo de ventas, gastos operativos, depreciación, intereses e impuestos y ganancia neta',
  };

  // Insight: salud del margen neto (dinámico)
  const mb = Number(margenBruto.toFixed(1));
  const mn = Number(margenNeto.toFixed(1));
  let _insight: any;
  if (gananciaNeta < 0) {
    _insight = {
      title: 'Estás operando a pérdida',
      text: `Aunque el margen bruto es **${mb}%**, después de gastos, depreciación e impuestos el resultado es **negativo (${mn}%)**: perdés **$${Math.abs(Math.round(gananciaNeta)).toLocaleString('es-AR')}**. La estructura de costos se come toda la ganancia bruta.`,
      tone: 'warn',
      icon: '🔻',
    };
  } else if (mn >= 10) {
    _insight = {
      title: 'Margen neto sólido',
      text: `De cada $100 de ventas te quedan **$${mn.toFixed(0)} netos** (margen neto ${mn}%). Partís de un bruto del **${mb}%** y la diferencia se va en operación e impuestos: una conversión saludable.`,
      tone: 'good',
      icon: '💹',
    };
  } else {
    _insight = {
      title: 'Margen neto ajustado',
      text: `Tu margen bruto es **${mb}%** pero el neto baja a **${mn}%**: de cada $100 vendidos quedan apenas $${mn.toFixed(0)} netos. La brecha (${(mb - mn).toFixed(1)} pts) son gastos, depreciación e impuestos a vigilar.`,
      tone: 'neutral',
      icon: '📊',
    };
  }

  return {
    gananciaBruta: Math.round(gananciaBruta),
    margenBruto: Number(margenBruto.toFixed(2)),
    ebitda: Math.round(ebitda),
    margenEbitda: Number(margenEbitda.toFixed(2)),
    gananciaOperativa: Math.round(gananciaOperativa),
    margenOperativo: Number(margenOperativo.toFixed(2)),
    gananciaNeta: Math.round(gananciaNeta),
    margenNeto: Number(margenNeto.toFixed(2)),
    resumen,
    _chart: chart,
    _insight,
  };
}
