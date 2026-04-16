/** ¿El descuento del Black Friday es real? */
export interface Inputs {
  precioAnterior: number;
  precioTachado: number;
  precioActual: number;
}
export interface Outputs {
  descuentoAnunciado: string;
  descuentoReal: string;
  ahorroReal: number;
  veredicto: string;
}

export function blackFridayDescuentoReal(i: Inputs): Outputs {
  const anterior = Number(i.precioAnterior);
  const tachado = Number(i.precioTachado);
  const actual = Number(i.precioActual);

  if (!anterior || anterior <= 0) throw new Error('Ingresá el precio que viste antes');
  if (!tachado || tachado <= 0) throw new Error('Ingresá el precio tachado');
  if (!actual || actual <= 0) throw new Error('Ingresá el precio actual');

  const descAnunciado = ((tachado - actual) / tachado) * 100;
  const descReal = ((anterior - actual) / anterior) * 100;
  const ahorroReal = anterior - actual;
  const precioInflado = tachado > anterior * 1.05; // más de 5% de inflación

  let veredicto: string;
  if (actual >= anterior) {
    veredicto = '🚫 No hay descuento real. El precio actual es igual o mayor al que tenía antes del evento.';
  } else if (precioInflado && descReal < descAnunciado * 0.5) {
    veredicto = `⚠️ Descuento inflado. Te anuncian ${descAnunciado.toFixed(1)}% pero el descuento real es solo ${descReal.toFixed(1)}%. Inflaron el precio de $${anterior.toLocaleString('es-AR')} a $${tachado.toLocaleString('es-AR')} antes de la promo.`;
  } else if (precioInflado) {
    veredicto = `⚠️ Precio inflado, pero hay algo de descuento real (${descReal.toFixed(1)}%). El tachado es más alto que el precio pre-evento.`;
  } else {
    veredicto = `✅ Descuento legítimo del ${descReal.toFixed(1)}%. El precio tachado coincide con el anterior. Buen momento para comprar.`;
  }

  return {
    descuentoAnunciado: `${descAnunciado.toFixed(1)}%`,
    descuentoReal: descReal > 0 ? `${descReal.toFixed(1)}%` : 'Sin descuento',
    ahorroReal: Math.max(0, Math.round(ahorroReal)),
    veredicto,
  };
}
