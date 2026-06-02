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
  _insight?: any;
  _chart?: any;
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

  // Insight dinámico: si hay CCL, interpretamos prima/descuento; si no, el TC implícito.
  let _insight: any;
  let _chart: any;
  if (tcCCL > 0) {
    const diffPct = ((tcImplicito / tcCCL) - 1) * 100;
    const absPct = Math.abs(diffPct).toFixed(2);
    if (diffPct > 0.5) {
      _insight = {
        title: 'CEDEAR con prima',
        text: `Estás pagando un dólar implícito de **$${tcImplicito.toFixed(2)}**, un **${absPct}% más caro** que el CCL de referencia ($${tcCCL.toLocaleString('es-AR')}). Comprás los dólares con sobreprecio: conviene esperar o mirar el activo subyacente.`,
        tone: 'warn',
        icon: '📈',
      };
    } else if (diffPct < -0.5) {
      _insight = {
        title: 'CEDEAR con descuento',
        text: `El dólar implícito es **$${tcImplicito.toFixed(2)}**, un **${absPct}% más barato** que el CCL ($${tcCCL.toLocaleString('es-AR')}). Estás comprando dólares con descuento vía CEDEAR: oportunidad de arbitraje a favor tuyo.`,
        tone: 'good',
        icon: '💸',
      };
    } else {
      _insight = {
        title: 'CEDEAR a precio justo',
        text: `El dólar implícito ($${tcImplicito.toFixed(2)}) está prácticamente **alineado con el CCL** ($${tcCCL.toLocaleString('es-AR')}): sólo **${absPct}%** de diferencia. El CEDEAR cotiza en paridad, sin prima ni descuento relevante.`,
        tone: 'neutral',
        icon: '⚖️',
      };
    }
    // Gauge: dólar implícito sobre el eje del CCL (zonas de descuento / paridad / prima).
    _chart = {
      type: 'scale',
      marker: Number(tcImplicito.toFixed(2)),
      markerLabel: `Implícito $${tcImplicito.toFixed(2)}`,
      min: 0,
      segments: [
        { nombre: 'Descuento', max: Number((tcCCL * 0.995).toFixed(2)), color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Paridad', max: Number((tcCCL * 1.005).toFixed(2)), color: '#64748b', colorDark: '#94a3b8' },
        { nombre: 'Prima', max: Number(Math.max(tcImplicito * 1.05, tcCCL * 1.05).toFixed(2)), color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Dólar implícito $${tcImplicito.toFixed(2)} frente al CCL $${tcCCL.toLocaleString('es-AR')}: zonas de descuento, paridad y prima`,
    };
  } else {
    _insight = {
      title: 'Tipo de cambio implícito',
      text: `Comprando este CEDEAR a $${Math.round(precioCedear).toLocaleString('es-AR')} con ratio ${ratio}:1, estás comprando dólares a **$${tcImplicito.toFixed(2)}/USD**. Ingresá el CCL de referencia para saber si pagás prima o descuento.`,
      tone: 'neutral',
      icon: '💵',
    };
  }

  return {
    tcImplicito: `$${tcImplicito.toFixed(2)}/USD`,
    precioTeorico: Math.round(precioTeorico),
    primaDcto,
    valorUSD: valorUSDStr,
    detalle: `El CEDEAR cotiza a $${Math.round(precioCedear).toLocaleString('es-AR')} con ratio ${ratio}:1. Tipo de cambio implícito: $${tcImplicito.toFixed(2)}/USD. Cada CEDEAR equivale a 1/${ratio} de acción = USD ${(precioUSD / ratio).toFixed(2)}.${precioTeoricoStr}${detalleExtra}`,
    _insight,
    _chart,
  };
}
