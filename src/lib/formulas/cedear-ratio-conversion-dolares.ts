/**
 * Calculadora de CEDEAR — ratio de conversión a dólares.
 *
 * TC implícito = (precio_cedear_ARS × ratio) / precio_accion_USD
 *   - Si el usuario ingresa un TC CCL de referencia, comparamos el implícito
 *     vs ese CCL para reportar prima (CEDEAR caro) o descuento (CEDEAR barato).
 *   - Precio teórico del CEDEAR = (precio_accion_USD × TC CCL) / ratio
 *     → arbitraje perfecto: precio mercado debería igualar al teórico.
 */

export interface CedearRatioConversionDolaresInputs {
  precioAccionUSD: number;
  ratio: number;
  precioCedearARS: number;
  /** Opcional. Si viene, calcula prima/descuento real vs este CCL. */
  tcCCL?: number;
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
  const tcCCL = Number(inputs.tcCCL) || 0;
  const cantidad = Number(inputs.cantidadCedears) || 0;

  if (!precioUSD || precioUSD <= 0) throw new Error('Ingresá el precio de la acción en USD');
  if (!ratio || ratio <= 0) throw new Error('Ingresá el ratio de conversión');
  if (!precioCedear || precioCedear <= 0) throw new Error('Ingresá el precio del CEDEAR en ARS');

  // TC implícito: el dólar que estás "comprando" al comprar este CEDEAR.
  const tcImplicito = (precioCedear * ratio) / precioUSD;

  // Precio teórico: qué debería valer el CEDEAR si arbitrara perfectamente
  // contra el CCL de referencia. Requiere tcCCL; si no está, devolvemos el
  // precio de mercado como best-effort.
  const precioTeorico = tcCCL > 0 ? (precioUSD * tcCCL) / ratio : precioCedear;

  // Prima/descuento: diferencia porcentual entre implícito y CCL.
  //   implícito > CCL → CEDEAR pagás un sobreprecio (prima positiva).
  //   implícito < CCL → CEDEAR con descuento (comprás dólares más baratos).
  let primaDcto: string;
  if (tcCCL > 0) {
    const diffPct = ((tcImplicito / tcCCL) - 1) * 100;
    const signo = diffPct >= 0 ? '+' : '';
    const label = diffPct >= 0 ? 'prima (CEDEAR caro)' : 'descuento (CEDEAR barato)';
    primaDcto = `${signo}${diffPct.toFixed(2)}% vs CCL $${tcCCL.toLocaleString('es-AR')} — ${label}`;
  } else {
    primaDcto = `TC implícito $${tcImplicito.toFixed(2)}. Ingresá el CCL para ver prima/descuento.`;
  }

  // Valor en dólares (si el usuario ingresó cantidad)
  const valorEnAcciones = cantidad > 0 ? cantidad / ratio : 0;
  const valorUSD = valorEnAcciones * precioUSD;
  const valorARS = cantidad > 0 ? cantidad * precioCedear : 0;

  let valorUSDStr = 'Ingresá cantidad de CEDEARs para calcular';
  let detalleExtra = '';
  if (cantidad > 0) {
    valorUSDStr = `USD ${valorUSD.toFixed(2)} (${valorEnAcciones.toFixed(4)} acciones)`;
    detalleExtra = ` Tus ${cantidad} CEDEARs equivalen a ${valorEnAcciones.toFixed(4)} acciones = USD ${valorUSD.toFixed(2)} (ARS $${Math.round(valorARS).toLocaleString('es-AR')}).`;
  }

  const precioTeoricoStr = tcCCL > 0
    ? ` Precio teórico (vs CCL $${tcCCL.toLocaleString('es-AR')}): $${Math.round(precioTeorico).toLocaleString('es-AR')}.`
    : '';

  return {
    tcImplicito: `$${tcImplicito.toFixed(2)}/USD`,
    precioTeorico: Math.round(precioTeorico),
    primaDcto,
    valorUSD: valorUSDStr,
    detalle: `El CEDEAR cotiza a $${Math.round(precioCedear).toLocaleString('es-AR')} con ratio ${ratio}:1. Tipo de cambio implícito: $${tcImplicito.toFixed(2)}/USD. Cada CEDEAR equivale a 1/${ratio} de acción = USD ${(precioUSD / ratio).toFixed(2)}.${precioTeoricoStr}${detalleExtra}`,
  };
}
