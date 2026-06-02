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
  _insight?: any;
  _chart?: any;
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
  let tone: 'good' | 'warn' | 'neutral';
  if (actual >= anterior) {
    veredicto = '🚫 No hay descuento real. El precio actual es igual o mayor al que tenía antes del evento.';
    tone = 'warn';
  } else if (precioInflado && descReal < descAnunciado * 0.5) {
    veredicto = `⚠️ Descuento inflado. Te anuncian ${descAnunciado.toFixed(1)}% pero el descuento real es solo ${descReal.toFixed(1)}%. Inflaron el precio de $${anterior.toLocaleString('es-AR')} a $${tachado.toLocaleString('es-AR')} antes de la promo.`;
    tone = 'warn';
  } else if (precioInflado) {
    veredicto = `⚠️ Precio inflado, pero hay algo de descuento real (${descReal.toFixed(1)}%). El tachado es más alto que el precio pre-evento.`;
    tone = 'warn';
  } else {
    veredicto = `✅ Descuento legítimo del ${descReal.toFixed(1)}%. El precio tachado coincide con el anterior. Buen momento para comprar.`;
    tone = 'good';
  }

  const ahorroFinal = Math.max(0, Math.round(ahorroReal));

  // Insight: interpreta brecha entre descuento anunciado y real.
  const brecha = descAnunciado - descReal;
  let insightText: string;
  if (actual >= anterior) {
    insightText = `El precio actual (**$${actual.toLocaleString('es-AR')}**) está igual o por encima del que ya tenías visto (**$${anterior.toLocaleString('es-AR')}**): el ${descAnunciado.toFixed(1)}% anunciado no se traduce en ahorro real.`;
  } else if (brecha > 5) {
    insightText = `Te muestran un **${descAnunciado.toFixed(1)}%** sobre el tachado, pero contra el precio que ya habías visto el descuento real es **${descReal.toFixed(1)}%**: ahorrás **$${ahorroFinal.toLocaleString('es-AR')}**, no lo que promete el cartel.`;
  } else {
    insightText = `El tachado coincide con lo que ya valía: el **${descReal.toFixed(1)}%** es genuino y te ahorrás **$${ahorroFinal.toLocaleString('es-AR')}** reales sobre los $${anterior.toLocaleString('es-AR')}.`;
  }

  const out: Outputs = {
    descuentoAnunciado: `${descAnunciado.toFixed(1)}%`,
    descuentoReal: descReal > 0 ? `${descReal.toFixed(1)}%` : 'Sin descuento',
    ahorroReal: ahorroFinal,
    veredicto,
    _insight: {
      title: tone === 'good' ? 'Descuento genuino' : 'Ojo con la letra chica',
      text: insightText,
      tone,
      icon: tone === 'good' ? '✅' : '🔍',
    },
  };

  // Donut sólo si hay ahorro real positivo: precio anterior = lo que pagás + lo que ahorrás.
  if (actual < anterior && ahorroFinal > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Pagás ahora', value: Math.round(anterior) - ahorroFinal },
        { label: 'Ahorro real', value: ahorroFinal },
      ],
      prefix: '$',
      centerValue: `$${Math.round(anterior).toLocaleString('es-AR')}`,
      centerLabel: 'Precio anterior',
      ariaLabel: `Del precio anterior de $${anterior.toLocaleString('es-AR')}, pagás $${actual.toLocaleString('es-AR')} y ahorrás $${ahorroFinal.toLocaleString('es-AR')}.`,
    };
  }

  return out;
}
