/** Dólar MEP comisión real comparativa brokers (Cocos / IOL / Bull / PPI) */
export interface Inputs { montoArs: number; tipoCambioMep: number; comisionCompraPct: number; comisionVentaPct: number; derechoMercadoPct: number; }
export interface Outputs { dolaresNetos: number; tipoCambioEfectivo: number; spreadVsMepPct: number; costoTotalArs: number; explicacion: string; _chart?: any; }
export function dolarMepCocosIolComisionReal(i: Inputs): Outputs {
  const ars = Number(i.montoArs);
  const mep = Number(i.tipoCambioMep);
  const cCompra = Number(i.comisionCompraPct) / 100;
  const cVenta = Number(i.comisionVentaPct) / 100;
  const derecho = Number(i.derechoMercadoPct) / 100;
  if (!ars || ars <= 0) throw new Error('Ingresá el monto en pesos');
  if (!mep || mep <= 0) throw new Error('Ingresá el tipo de cambio MEP');
  const compraNeta = ars * (1 - cCompra - derecho);
  const dolaresBrutos = compraNeta / mep;
  const dolaresNetos = dolaresBrutos * (1 - cVenta - derecho);
  const tcEfectivo = ars / dolaresNetos;
  const spread = ((tcEfectivo - mep) / mep) * 100;
  const costoTotal = ars - dolaresNetos * mep;
  const valorDolaresArs = dolaresNetos * mep;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Valor en USD recibido', value: Math.round(valorDolaresArs) },
      { label: 'Costo (comisiones + derechos)', value: Math.round(costoTotal) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(ars).toLocaleString('es-AR'),
    centerLabel: 'Pesos invertidos',
    ariaLabel: 'Composición de los pesos invertidos en dólar MEP: valor en USD efectivamente recibido frente al costo total de comisiones y derechos de mercado.',
  };
  return {
    dolaresNetos: Number(dolaresNetos.toFixed(2)),
    tipoCambioEfectivo: Number(tcEfectivo.toFixed(2)),
    spreadVsMepPct: Number(spread.toFixed(3)),
    costoTotalArs: Number(costoTotal.toFixed(2)),
    explicacion: `Convertís $${ars.toLocaleString('es-AR')} ARS a USD ${dolaresNetos.toFixed(2)} netos. TC efectivo $${tcEfectivo.toFixed(2)} (spread ${spread.toFixed(2)}% vs MEP $${mep}).`,
    _chart: chart,
  };
}
