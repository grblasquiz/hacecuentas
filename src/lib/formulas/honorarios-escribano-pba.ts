/**
 * Honorarios Escribano PBA — escritura compraventa.
 * Tabla orientativa Colegio de Escribanos de la Provincia de Buenos Aires 2026.
 * Ligeramente distinta a CABA: 1.5% tramo 1, tramos decrecientes.
 * IVA 21% + aportes Caja Seguridad Social Escribanos PBA ~12%.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; }

export function honorariosEscribanoPba(i: Inputs): Outputs {
  const v = Math.max(0, Number(i.valorEscritura) || 0);
  if (v <= 0) throw new Error('Ingresá el valor de escritura');

  const T1 = 20_000_000, T2 = 80_000_000, T3 = 250_000_000;
  let honorarios = 0;
  if (v <= T1) honorarios = v * 0.015;
  else if (v <= T2) honorarios = T1 * 0.015 + (v - T1) * 0.0115;
  else if (v <= T3) honorarios = T1 * 0.015 + (T2 - T1) * 0.0115 + (v - T2) * 0.009;
  else honorarios = T1 * 0.015 + (T2 - T1) * 0.0115 + (T3 - T2) * 0.009 + (v - T3) * 0.0075;

  const iva = honorarios * 0.21;
  const aportes = honorarios * 0.12;
  const gastosFijos = 160000;
  const total = honorarios + iva + aportes + gastosFijos;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Honorarios', value: honorarios },
      { label: 'IVA 21%', value: iva },
      { label: 'Aportes Caja', value: aportes },
      { label: 'Gastos fijos', value: gastosFijos },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: 'Composición del costo de escritura: honorarios, IVA, aportes y gastos fijos',
  };

  const pctSobreValor = v > 0 ? (total / v) * 100 : 0;
  const insight = {
    title: 'Qué significa',
    text: `Escriturar una propiedad de ${fmt(v)} en la Provincia de Buenos Aires cuesta unos **${fmt(total)}** vía escribano, ~**${pctSobreValor.toFixed(1)}%** del valor. De ese total, ${fmt(honorarios)} son honorarios y el resto es IVA, aportes a la Caja y gastos fijos. En compraventa, suele afrontarlos el comprador salvo pacto distinto.`,
    tone: 'neutral' as 'good' | 'warn' | 'neutral',
    icon: '📜',
  };

  return {
    honorarios: fmt(honorarios),
    iva: fmt(iva),
    aportes: fmt(aportes),
    gastosFijos: fmt(gastosFijos),
    total: fmt(total),
    resumen: `Honorarios ${fmt(honorarios)} + IVA 21% + aportes Caja ~12% + gastos. Total ${fmt(total)}.`,
    _chart: chart,
    _insight: insight,
  };
}
