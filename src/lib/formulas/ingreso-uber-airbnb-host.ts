/** Ingreso Airbnb host */
export interface Inputs { tarifaNoche: number; ocupacionPct: number; costoLimpieza: number; estadiaPromedio: number; gastosFijosMes: number; impuestosPct: number; }
export interface Outputs { ingresoNetoAnual: number; ingresoBrutoAnual: number; ingresoMensual: number; nochesAlAno: number; checkinsAno: number; _chart?: any; _insight?: any; }
export function ingresoUberAirbnbHost(i: Inputs): Outputs {
  const tarifa = Number(i.tarifaNoche);
  const ocup = Number(i.ocupacionPct) / 100;
  const limp = Number(i.costoLimpieza);
  const est = Number(i.estadiaPromedio);
  const fijos = Number(i.gastosFijosMes);
  const imp = Number(i.impuestosPct) / 100;
  if (tarifa < 0 || est < 1) throw new Error('Valores inválidos');
  const noches = 365 * ocup;
  const checkins = noches / est;
  const bruto = noches * tarifa;
  const fee = bruto * 0.03;
  const totalLimp = checkins * limp;
  const gastosFijosAnual = fijos * 12;
  const impuestos = bruto * imp;
  const neto = bruto - fee - totalLimp - gastosFijosAnual - impuestos;
  const chart =
    bruto > 0 && neto >= 0
      ? {
          type: 'doughnut' as const,
          slices: [
            { label: 'Ingreso neto', value: Math.round(neto) },
            { label: 'Comisión Airbnb (3%)', value: Math.round(fee) },
            { label: 'Limpieza', value: Math.round(totalLimp) },
            { label: 'Gastos fijos', value: Math.round(gastosFijosAnual) },
            { label: 'Impuestos', value: Math.round(impuestos) },
          ].filter((s) => s.value > 0),
          prefix: '$',
          centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
          centerLabel: 'Ingreso bruto',
          ariaLabel: 'Descomposición del ingreso bruto anual: ingreso neto, comisión de Airbnb, limpieza, gastos fijos e impuestos',
        }
      : undefined;
  const margen = bruto > 0 ? (neto / bruto) * 100 : 0;
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  let insight: Outputs['_insight'];
  if (neto <= 0) {
    insight = {
      title: 'El alquiler no cierra',
      text:
        `Con esta ocupación y tarifa, los gastos fijos, la limpieza, la comisión y los impuestos se comen todo el ingreso bruto de **${fmt(bruto)}** y el resultado neto da **negativo o cero**. ` +
        `Subí la tarifa o la ocupación, o recortá los gastos fijos para que la operación sea rentable.`,
      tone: 'warn' as const,
      icon: '🏚️',
    };
  } else {
    insight = {
      title: 'Lo que te queda en el bolsillo',
      text:
        `De **${fmt(bruto)}** de ingreso bruto anual te quedan **${fmt(neto)}** netos (unos **${fmt(neto / 12)}** por mes), ` +
        `un margen del **${margen.toFixed(0)}%** después de comisión, limpieza, gastos fijos e impuestos sobre **${Math.round(noches)} noches** ocupadas.`,
      tone: (margen < 30 ? 'warn' : 'good') as 'warn' | 'good',
      icon: '🏡',
    };
  }
  return {
    ingresoNetoAnual: Math.round(neto),
    ingresoBrutoAnual: Math.round(bruto),
    ingresoMensual: Math.round(neto / 12),
    nochesAlAno: Math.round(noches),
    checkinsAno: Math.round(checkins),
    _chart: chart,
    _insight: insight
  };
}
