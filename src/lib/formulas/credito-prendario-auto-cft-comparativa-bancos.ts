/** Crédito prendario auto: comparativa CFT entre bancos AR */
export interface Inputs { montoCredito: number; plazoMeses: number; tnaBancoPct: number; gastosOtorgamientoPct: number; seguroMensual: number; }
export interface Outputs { cuotaMensual: number; totalAPagar: number; intereses: number; cftEstimadoPct: number; costoTotalConSeguro: number; explicacion: string; }
export function creditoPrendarioAutoCftComparativaBancos(i: Inputs): Outputs {
  const monto = Number(i.montoCredito);
  const plazo = Number(i.plazoMeses);
  const tnm = Number(i.tnaBancoPct) / 100 / 12;
  const gastos = Number(i.gastosOtorgamientoPct) / 100;
  const seguro = Number(i.seguroMensual);
  if (!monto || monto <= 0) throw new Error('Ingresá el monto');
  if (!plazo || plazo <= 0) throw new Error('Ingresá el plazo');
  // Sistema francés
  const cuota = tnm > 0
    ? monto * (tnm * Math.pow(1 + tnm, plazo)) / (Math.pow(1 + tnm, plazo) - 1)
    : monto / plazo;
  const total = cuota * plazo;
  const intereses = total - monto;
  const gastosOtorg = monto * gastos;
  const seguroTotal = seguro * plazo;
  const costoTotal = total + gastosOtorg + seguroTotal;
  // CFT estimado: anualizar costo total
  const cftAnual = (Math.pow(costoTotal / monto, 12 / plazo) - 1) * 100;
  return {
    cuotaMensual: Number(cuota.toFixed(2)),
    totalAPagar: Number(total.toFixed(2)),
    intereses: Number(intereses.toFixed(2)),
    cftEstimadoPct: Number(cftAnual.toFixed(2)),
    costoTotalConSeguro: Number(costoTotal.toFixed(2)),
    explicacion: `Cuota: $${cuota.toFixed(0)}. Total a pagar: $${total.toFixed(0)}. CFT estimado: ${cftAnual.toFixed(2)}% anual.`,
  };
}
