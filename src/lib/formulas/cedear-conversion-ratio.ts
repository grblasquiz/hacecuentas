/** Precio teórico de CEDEAR según ratio de conversión y tipo de cambio */

export interface Inputs {
  precioAccionUsd: number;
  ratioCedear: number;
  tipoCambioCcl: number;
  precioCedearActual: number;
}

export interface Outputs {
  precioTeorico: number;
  precioCedearUsd: number;
  primaDescuento: number;
  tipoCambioImplicito: number;
  arbitraje: string;
  formula: string;
  explicacion: string;
}

export function cedearConversionRatio(i: Inputs): Outputs {
  const precioUsd = Number(i.precioAccionUsd);
  const ratio = Number(i.ratioCedear);
  const ccl = Number(i.tipoCambioCcl);
  const precioActual = Number(i.precioCedearActual) || 0;

  if (!precioUsd || precioUsd <= 0) throw new Error('Ingresá el precio de la acción en USD');
  if (!ratio || ratio <= 0) throw new Error('Ingresá el ratio de conversión del CEDEAR');
  if (!ccl || ccl <= 0) throw new Error('Ingresá el tipo de cambio CCL');

  // Precio teórico = (Precio USD / Ratio) × CCL
  const precioTeorico = (precioUsd / ratio) * ccl;
  const precioCedearUsd = precioUsd / ratio;

  let primaDescuento = 0;
  let tipoCambioImplicito = 0;
  let arbitraje = 'Sin dato de precio actual';

  if (precioActual > 0) {
    primaDescuento = ((precioActual - precioTeorico) / precioTeorico) * 100;
    tipoCambioImplicito = (precioActual * ratio) / precioUsd;

    if (primaDescuento > 2) {
      arbitraje = `Prima de ${primaDescuento.toFixed(2)}% — CEDEAR caro respecto al precio teórico`;
    } else if (primaDescuento < -2) {
      arbitraje = `Descuento de ${Math.abs(primaDescuento).toFixed(2)}% — CEDEAR barato respecto al precio teórico`;
    } else {
      arbitraje = 'Precio alineado al teórico (±2%)';
    }
  }

  const formula = `Precio teórico = ($${precioUsd} / ${ratio}) × $${ccl} = $${precioTeorico.toFixed(2)} ARS`;
  const explicacion = `Acción: $${precioUsd} USD. Ratio CEDEAR: ${ratio}:1 (cada CEDEAR = ${(1 / ratio).toFixed(4)} acciones = $${precioCedearUsd.toFixed(2)} USD). Al CCL $${ccl.toLocaleString()}, precio teórico: $${Math.round(precioTeorico).toLocaleString()} ARS.${precioActual > 0 ? ` Precio actual: $${precioActual.toLocaleString()} ARS. ${arbitraje}. Tipo de cambio implícito: $${tipoCambioImplicito.toFixed(2)}.` : ''}`;

  return {
    precioTeorico: Number(precioTeorico.toFixed(2)),
    precioCedearUsd: Number(precioCedearUsd.toFixed(4)),
    primaDescuento: Number(primaDescuento.toFixed(2)),
    tipoCambioImplicito: Number(tipoCambioImplicito.toFixed(2)),
    arbitraje,
    formula,
    explicacion,
  };
}
