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
  _insight?: any;
  _chart?: any;
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

  let _insight: any;
  let _chart: any;
  if (precioActual > 0) {
    const caro = primaDescuento > 2;
    const barato = primaDescuento < -2;
    const tono = caro ? 'warn' : barato ? 'good' : 'neutral';
    const ic = caro ? '🔺' : barato ? '🟢' : '⚖️';
    _insight = {
      title: caro ? 'CEDEAR caro' : barato ? 'CEDEAR barato' : 'Precio alineado',
      text: caro
        ? `El CEDEAR cotiza **$${Math.round(precioActual).toLocaleString()}** vs un teórico de **$${Math.round(precioTeorico).toLocaleString()}**: paga una **prima de ${primaDescuento.toFixed(2)}%**. El CCL implícito ($${tipoCambioImplicito.toFixed(2)}) está por encima del CCL que cargaste.`
        : barato
        ? `El CEDEAR cotiza **$${Math.round(precioActual).toLocaleString()}** vs un teórico de **$${Math.round(precioTeorico).toLocaleString()}**: cotiza con un **descuento de ${Math.abs(primaDescuento).toFixed(2)}%**. El CCL implícito ($${tipoCambioImplicito.toFixed(2)}) está por debajo del que cargaste.`
        : `El CEDEAR cotiza **$${Math.round(precioActual).toLocaleString()}**, prácticamente en línea con su teórico ($${Math.round(precioTeorico).toLocaleString()}): apenas **${primaDescuento.toFixed(2)}%** de diferencia, sin arbitraje claro.`,
      tone: tono,
      icon: ic,
    };
    const bound = Math.max(6, Math.ceil(Math.abs(primaDescuento)) + 2);
    _chart = {
      type: 'scale',
      marker: Number(primaDescuento.toFixed(2)),
      markerLabel: 'Prima/Descuento',
      min: -bound,
      segments: [
        { nombre: 'Descuento', max: -2, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Alineado', max: 2, color: '#9ca3af', colorDark: '#6b7280' },
        { nombre: 'Prima', max: bound, color: '#ef4444', colorDark: '#dc2626' },
      ],
      ariaLabel: 'Prima o descuento del CEDEAR respecto a su precio teórico, en porcentaje',
    };
  } else {
    _insight = {
      title: 'Precio teórico del CEDEAR',
      text: `Con la acción a **$${precioUsd} USD**, ratio **${ratio}:1** y CCL **$${ccl.toLocaleString()}**, el precio teórico es **$${Math.round(precioTeorico).toLocaleString()} ARS**. Cargá el precio de mercado actual para ver si cotiza con prima o descuento.`,
      tone: 'neutral',
      icon: '🧮',
    };
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
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
