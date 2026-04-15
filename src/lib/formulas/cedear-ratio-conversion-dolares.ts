/**
 * Calculadora de CEDEAR — ratio de conversión a dólares
 * TC implícito = (precio_cedear_ARS × ratio) / precio_accion_USD
 */

export interface CedearRatioConversionDolaresInputs {
  precioAccionUSD: number;
  ratio: number;
  precioCedearARS: number;
  cantidadCedears?: number;
}

export interface CedearRatioConversionDolaresOutputs {
  tcImplicito: string;
  precioTeorico: number;
  primaDcto: string;
  valorUSD: string;
  detalle: string;
}

export function cedearRatioConversionDolares(
  inputs: CedearRatioConversionDolaresInputs
): CedearRatioConversionDolaresOutputs {
  const precioUSD = Number(inputs.precioAccionUSD);
  const ratio = Math.round(Number(inputs.ratio));
  const precioCedear = Number(inputs.precioCedearARS);
  const cantidad = Number(inputs.cantidadCedears) || 0;

  if (!precioUSD || precioUSD <= 0) throw new Error('Ingresá el precio de la acción en USD');
  if (!ratio || ratio <= 0) throw new Error('Ingresá el ratio de conversión');
  if (!precioCedear || precioCedear <= 0) throw new Error('Ingresá el precio del CEDEAR en ARS');

  // TC implícito
  const tcImplicito = (precioCedear * ratio) / precioUSD;

  // Precio teórico usando el TC implícito como referencia
  // (esto es circular, así que mostramos el TC implícito como dato principal)
  const precioTeorico = precioCedear; // el precio actual ES el de mercado

  // Para prima/descuento necesitaríamos un TC de referencia
  // Usamos el TC implícito como información
  const valorEnAcciones = cantidad > 0 ? cantidad / ratio : 0;
  const valorUSD = valorEnAcciones * precioUSD;
  const valorARS = cantidad > 0 ? cantidad * precioCedear : 0;

  let valorUSDStr = 'Ingresá cantidad de CEDEARs para calcular';
  let detalleExtra = '';
  if (cantidad > 0) {
    valorUSDStr = `USD ${valorUSD.toFixed(2)} (${valorEnAcciones.toFixed(4)} acciones)`;
    detalleExtra = ` Tus ${cantidad} CEDEARs equivalen a ${valorEnAcciones.toFixed(4)} acciones = USD ${valorUSD.toFixed(2)} (ARS $${Math.round(valorARS).toLocaleString('es-AR')}).`;
  }

  return {
    tcImplicito: `$${tcImplicito.toFixed(2)}/USD`,
    precioTeorico: Math.round(precioCedear),
    primaDcto: `TC implícito: $${tcImplicito.toFixed(2)}. Compará con el dólar CCL del momento para ver si hay prima o descuento.`,
    valorUSD: valorUSDStr,
    detalle: `El CEDEAR cotiza a $${Math.round(precioCedear).toLocaleString('es-AR')} con ratio ${ratio}:1. Tipo de cambio implícito: $${tcImplicito.toFixed(2)}/USD. Cada CEDEAR equivale a 1/${ratio} de acción = USD ${(precioUSD / ratio).toFixed(2)}.${detalleExtra}`,
  };
}
