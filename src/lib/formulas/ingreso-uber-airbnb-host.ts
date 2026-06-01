/** Ingreso Airbnb host */
export interface Inputs { tarifaNoche: number; ocupacionPct: number; costoLimpieza: number; estadiaPromedio: number; gastosFijosMes: number; impuestosPct: number; }
export interface Outputs { ingresoNetoAnual: number; ingresoBrutoAnual: number; ingresoMensual: number; nochesAlAno: number; checkinsAno: number; _chart?: any; }
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
  return {
    ingresoNetoAnual: Math.round(neto),
    ingresoBrutoAnual: Math.round(bruto),
    ingresoMensual: Math.round(neto / 12),
    nochesAlAno: Math.round(noches),
    checkinsAno: Math.round(checkins),
    _chart: chart
  };
}
