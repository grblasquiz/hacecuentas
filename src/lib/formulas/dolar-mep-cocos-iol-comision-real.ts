/** Dólar MEP comisión real comparativa brokers (Cocos / IOL / Bull / PPI) */
export interface Inputs { montoArs: number; tipoCambioMep: number; comisionCompraPct: number; comisionVentaPct: number; derechoMercadoPct: number; }
export interface Outputs { dolaresNetos: number; tipoCambioEfectivo: number; spreadVsMepPct: number; costoTotalArs: number; explicacion: string; }
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
  return {
    dolaresNetos: Number(dolaresNetos.toFixed(2)),
    tipoCambioEfectivo: Number(tcEfectivo.toFixed(2)),
    spreadVsMepPct: Number(spread.toFixed(3)),
    costoTotalArs: Number(costoTotal.toFixed(2)),
    explicacion: `Convertís $${ars.toLocaleString('es-AR')} ARS a USD ${dolaresNetos.toFixed(2)} netos. TC efectivo $${tcEfectivo.toFixed(2)} (spread ${spread.toFixed(2)}% vs MEP $${mep}).`,
  };
}
