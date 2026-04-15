/**
 * Calculadora de deuda de tarjeta pagando el mínimo
 * Simula cuántos meses tarda en cancelarse (o si nunca se cancela)
 */

export interface DeudaTarjetaPagoMinimoMesesInputs {
  saldoActual: number;
  tna: number;
  pagoMinimoPct: number;
}

export interface DeudaTarjetaPagoMinimoMesesOutputs {
  mesesParaCancelar: number;
  totalPagado: number;
  interesesTotales: number;
  multiplicador: string;
  detalle: string;
}

export function deudaTarjetaPagoMinimoMeses(
  inputs: DeudaTarjetaPagoMinimoMesesInputs
): DeudaTarjetaPagoMinimoMesesOutputs {
  const saldo = Number(inputs.saldoActual);
  const tna = Number(inputs.tna);
  const pagoMinPct = Number(inputs.pagoMinimoPct);

  if (!saldo || saldo <= 0) throw new Error('Ingresá el saldo actual de la tarjeta');
  if (!tna || tna <= 0) throw new Error('Ingresá la TNA de la tarjeta');
  if (!pagoMinPct || pagoMinPct <= 0 || pagoMinPct > 100)
    throw new Error('Ingresá un porcentaje de pago mínimo válido (1-100%)');

  const tasaMensual = tna / 100 / 12;
  const minPct = pagoMinPct / 100;

  // Si el pago mínimo no cubre los intereses, la deuda nunca se cancela
  if (minPct <= tasaMensual) {
    const interesMes1 = Math.round(saldo * tasaMensual);
    const pagoMes1 = Math.round(saldo * minPct);
    return {
      mesesParaCancelar: -1,
      totalPagado: 0,
      interesesTotales: 0,
      multiplicador: '∞ (deuda infinita)',
      detalle: `Con TNA ${tna}% (${(tasaMensual * 100).toFixed(1)}% mensual) y pago mínimo del ${pagoMinPct}%, el pago ($${pagoMes1.toLocaleString('es-AR')}) no cubre los intereses mensuales ($${interesMes1.toLocaleString('es-AR')}). La deuda NUNCA se cancela y crece cada mes. Necesitás pagar al menos el ${(tasaMensual * 100 + 1).toFixed(0)}% del saldo o refinanciar.`,
    };
  }

  let saldoRestante = saldo;
  let totalPagado = 0;
  let meses = 0;
  const maxMeses = 600; // 50 años como tope de seguridad
  const pisoMinimo = 1000; // piso mínimo de pago $1000

  while (saldoRestante > 1 && meses < maxMeses) {
    const interes = saldoRestante * tasaMensual;
    let pagoMes = Math.max(saldoRestante * minPct, pisoMinimo);
    if (pagoMes > saldoRestante + interes) {
      pagoMes = saldoRestante + interes;
    }
    totalPagado += pagoMes;
    const capitalAmortizado = pagoMes - interes;
    saldoRestante -= capitalAmortizado;
    meses++;
  }

  if (meses >= maxMeses) {
    return {
      mesesParaCancelar: -1,
      totalPagado: Math.round(totalPagado),
      interesesTotales: Math.round(totalPagado - saldo),
      multiplicador: `+${maxMeses / 12} años (prácticamente nunca)`,
      detalle: `La deuda tardaría más de ${maxMeses / 12} años en cancelarse pagando el mínimo. Se recomienda refinanciar urgente.`,
    };
  }

  const interesesTotales = totalPagado - saldo;
  const mult = totalPagado / saldo;
  const anios = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  const tiempoStr =
    anios > 0
      ? `${anios} año${anios > 1 ? 's' : ''} y ${mesesRestantes} mes${mesesRestantes !== 1 ? 'es' : ''}`
      : `${meses} mes${meses > 1 ? 'es' : ''}`;

  return {
    mesesParaCancelar: meses,
    totalPagado: Math.round(totalPagado),
    interesesTotales: Math.round(interesesTotales),
    multiplicador: `${mult.toFixed(1)}x el monto original`,
    detalle: `Pagando el mínimo del ${pagoMinPct}%, tardás ${tiempoStr} en cancelar la deuda. Pagás $${Math.round(totalPagado).toLocaleString('es-AR')} en total (${mult.toFixed(1)} veces los $${saldo.toLocaleString('es-AR')} originales).`,
  };
}
