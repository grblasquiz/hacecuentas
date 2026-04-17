/** Comision Uber Eats / Glovo rider */
export interface Inputs { horasDia: number; diasMes: number; pedidosHora: number; pagoPromedio: number; tipPct: number; combustibleDia: number; amortizacionDia: number; }
export interface Outputs { ingresoNetoMes: number; ingresoBrutoMes: number; netoPorHora: number; costosTotalesMes: number; pedidosMes: number; }
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
  return {
    ingresoNetoMes: Math.round(neto),
    ingresoBrutoMes: Math.round(bruto),
    netoPorHora: horasTotales > 0 ? Number((neto / horasTotales).toFixed(2)) : 0,
    costosTotalesMes: Math.round(costos),
    pedidosMes
  };
}
