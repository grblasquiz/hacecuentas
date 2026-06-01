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
  };
}
