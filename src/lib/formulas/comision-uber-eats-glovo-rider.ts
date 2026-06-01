/** Comision Uber Eats / Glovo rider */
export interface Inputs { horasDia: number; diasMes: number; pedidosHora: number; pagoPromedio: number; tipPct: number; combustibleDia: number; amortizacionDia: number; }
export interface Outputs { ingresoNetoMes: number; ingresoBrutoMes: number; netoPorHora: number; costosTotalesMes: number; pedidosMes: number; _chart?: any; }
export function comisionUberEatsGlovoRider(i: Inputs): Outputs {
  const hs = Number(i.horasDia);
  const dias = Number(i.diasMes);
  const ph = Number(i.pedidosHora);
  const pago = Number(i.pagoPromedio);
  const tip = Number(i.tipPct) / 100;
  const comb = Number(i.combustibleDia);
  const amort = Number(i.amortizacionDia);
  if (hs < 0 || dias < 0) throw new Error('Valores inválidos');
  const pedidosMes = Math.round(ph * hs * dias);
  const bruto = pedidosMes * pago * (1 + tip);
  const costos = (comb + amort) * dias;
  const neto = bruto - costos;
  const horasTotales = hs * dias;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Ingreso neto', value: Math.max(0, Math.round(neto)) },
      { label: 'Costos (combustible + amortización)', value: Math.round(costos) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto mensual',
    ariaLabel: 'Composición del ingreso bruto: parte que queda como neto y parte que se va en costos',
  };
  return {
    ingresoNetoMes: Math.round(neto),
    ingresoBrutoMes: Math.round(bruto),
    netoPorHora: horasTotales > 0 ? Number((neto / horasTotales).toFixed(2)) : 0,
    costosTotalesMes: Math.round(costos),
    pedidosMes,
    _chart: chart
  };
}
