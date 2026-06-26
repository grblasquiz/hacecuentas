/** Cuánto facturar para cubrir gastos (freelancers/monotributistas)
 * Punto de equilibrio de facturación: cuánto tenés que facturar para que,
 * después de impuestos/comisiones, te quede para cubrir gastos fijos (+ margen).
 * Días hábiles ≈ 22/mes y horas ≈ 176/mes (8h × 22d) son convenciones estándar. */
export interface Inputs {
  gastosFijos: number;
  impuestosPct: number;
  margenDeseado?: number;
  __lang?: string;
}
export interface Outputs {
  facturacionMensual: number;
  facturacionDiaria: number;
  facturacionPorHora: number;
  impuestosAPagar: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function cuantoFacturarCubrirGastos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorGastos: 'Ingresá tus gastos fijos mensuales',
      errorImp: 'Ingresá el porcentaje de impuestos/comisiones (0 a 99)',
      insightTitle: 'Lo que te comen los impuestos',
      base: 'Para cubrir gastos + margen',
      imp: 'Impuestos y comisiones',
      total: 'Facturación mensual',
      chartAria: 'Composición de la facturación: lo que te queda más impuestos y comisiones.',
    },
    en: {
      errorGastos: 'Enter your fixed monthly expenses',
      errorImp: 'Enter the taxes/fees percentage (0 to 99)',
      insightTitle: 'What taxes eat up',
      base: 'To cover expenses + margin',
      imp: 'Taxes and fees',
      total: 'Monthly billing',
      chartAria: 'Billing breakdown: what you keep plus taxes and fees.',
    },
  } as const)[__lang];

  const gastosFijos = Number(i.gastosFijos);
  const impuestosPct = Number(i.impuestosPct);
  const margen = Number(i.margenDeseado) || 0;

  if (!gastosFijos || gastosFijos <= 0) throw new Error(T.errorGastos);
  if (impuestosPct < 0 || impuestosPct >= 100 || isNaN(impuestosPct)) throw new Error(T.errorImp);

  // base = lo que te tiene que quedar limpio (gastos + margen sobre los gastos)
  const base = gastosFijos * (1 + margen / 100);
  // gross-up: facturar de modo que tras retener impuestosPct, te quede `base`
  const facturacionMensual = base / (1 - impuestosPct / 100);
  const impuestosAPagar = facturacionMensual - base;
  const facturacionDiaria = facturacionMensual / 22;  // 22 días hábiles/mes
  const facturacionPorHora = facturacionMensual / 176; // 8h × 22d

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const pctImp = facturacionMensual > 0 ? (impuestosAPagar / facturacionMensual) * 100 : 0;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.base, value: Math.round(base) },
      { label: T.imp, value: Math.round(impuestosAPagar) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(facturacionMensual).toLocaleString(locale),
    centerLabel: T.total,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `To keep **$${Math.round(base).toLocaleString(locale)}** clean, you must bill **$${Math.round(facturacionMensual).toLocaleString(locale)}**: **$${Math.round(impuestosAPagar).toLocaleString(locale)}** (**${pctImp.toFixed(1)}%**) goes to taxes and fees.`
      : `Para que te queden **$${Math.round(base).toLocaleString(locale)}** limpios, tenés que facturar **$${Math.round(facturacionMensual).toLocaleString(locale)}**: **$${Math.round(impuestosAPagar).toLocaleString(locale)}** (**${pctImp.toFixed(1)}%**) se van en impuestos y comisiones.`,
    tone: 'warn' as const,
    icon: '🧾',
  };

  return {
    facturacionMensual: Math.round(facturacionMensual),
    facturacionDiaria: Math.round(facturacionDiaria),
    facturacionPorHora: Math.round(facturacionPorHora),
    impuestosAPagar: Math.round(impuestosAPagar),
    formula: `Facturación = ${Math.round(gastosFijos)} × (1 + ${margen}%) ÷ (1 − ${impuestosPct}%) = ${Math.round(facturacionMensual)}`,
    _chart: chart,
    _insight: insight,
  };
}
