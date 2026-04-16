/** Costo real de pagar solo el mínimo de la tarjeta de crédito */

export interface Inputs {
  saldoActual: number;
  tnaAnual: number;
  porcentajeMinimo: number;
  montoMinimoFijo: number;
}

export interface Outputs {
  pagoMinimoActual: number;
  mesesLiquidar: number;
  interesTotal: number;
  totalPagado: number;
  multiplicadorCosto: number;
  formula: string;
  explicacion: string;
}

export function tarjetaCreditoMinimoCosto(i: Inputs): Outputs {
  const saldo = Number(i.saldoActual);
  const tna = Number(i.tnaAnual);
  const porcMinimo = Number(i.porcentajeMinimo) || 5;
  const minimoFijo = Number(i.montoMinimoFijo) || 0;

  if (!saldo || saldo <= 0) throw new Error('Ingresá el saldo actual de la tarjeta');
  if (!tna || tna <= 0) throw new Error('Ingresá la TNA (tasa nominal anual)');

  const tasaMensual = tna / 100 / 12;
  let saldoRestante = saldo;
  let meses = 0;
  let interesTotal = 0;
  let totalPagado = 0;
  const MAX_MESES = 600;

  while (saldoRestante > 1 && meses < MAX_MESES) {
    meses++;
    const interes = saldoRestante * tasaMensual;
    interesTotal += interes;
    saldoRestante += interes;

    // Pago mínimo: mayor entre % del saldo y monto fijo
    const pagoMinimo = Math.max(saldoRestante * (porcMinimo / 100), minimoFijo, 100);
    const pago = Math.min(pagoMinimo, saldoRestante);
    saldoRestante -= pago;
    totalPagado += pago;
  }

  const pagoMinimoActual = Math.max(saldo * (porcMinimo / 100), minimoFijo, 100);
  const multiplicadorCosto = totalPagado / saldo;

  const formula = `$${saldo.toLocaleString()} al ${tna}% TNA pagando ${porcMinimo}% mínimo = ${meses} meses, $${Math.round(totalPagado).toLocaleString()} total`;
  const explicacion = `Saldo: $${saldo.toLocaleString()}. TNA: ${tna}% (${(tasaMensual * 100).toFixed(2)}% mensual). Pago mínimo actual: $${Math.round(pagoMinimoActual).toLocaleString()}. Si pagás solo el mínimo: tardás ${meses} meses (${(meses / 12).toFixed(1)} años) en liquidar. Pagás $${Math.round(interesTotal).toLocaleString()} en intereses. Total pagado: $${Math.round(totalPagado).toLocaleString()} (${multiplicadorCosto.toFixed(1)}x el saldo original). ¡Pagás ${multiplicadorCosto.toFixed(1)} veces lo que debías!`;

  return {
    pagoMinimoActual: Math.round(pagoMinimoActual),
    mesesLiquidar: meses,
    interesTotal: Math.round(interesTotal),
    totalPagado: Math.round(totalPagado),
    multiplicadorCosto: Number(multiplicadorCosto.toFixed(2)),
    formula,
    explicacion,
  };
}
