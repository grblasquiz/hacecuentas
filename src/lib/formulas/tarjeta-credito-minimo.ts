/** Costo de pagar solo el mínimo de la tarjeta */
export interface Inputs { saldoActual: number; tnaAnual: number; minimoPct?: number; }
export interface Outputs { totalPagado: number; interesesPagados: number; mesesPagar: number; costoFinanciacion: string; }

export function tarjetaCreditoMinimo(i: Inputs): Outputs {
  let saldo = Number(i.saldoActual);
  const tna = Number(i.tnaAnual);
  const minPct = Number(i.minimoPct) || 15;
  if (!saldo || saldo <= 0) throw new Error('Ingresá el saldo a financiar');
  if (tna < 0) throw new Error('La TNA no puede ser negativa');

  const tasaMensual = tna / 100 / 12;
  let totalPagado = 0;
  let meses = 0;
  const saldoOriginal = saldo;

  while (saldo > 100 && meses < 360) {
    meses++;
    const interes = saldo * tasaMensual;
    const minimo = Math.max(saldo * (minPct / 100), 2000);
    const pago = Math.min(minimo, saldo + interes);
    saldo = saldo + interes - pago;
    totalPagado += pago;
  }
  if (saldo > 0) { totalPagado += saldo; meses++; }

  const intereses = totalPagado - saldoOriginal;
  const costoPct = ((intereses / saldoOriginal) * 100).toFixed(0);

  return {
    totalPagado: Math.round(totalPagado),
    interesesPagados: Math.round(intereses),
    mesesPagar: meses,
    costoFinanciacion: `Pagás ${costoPct}% más del saldo original solo en intereses`,
  };
}
