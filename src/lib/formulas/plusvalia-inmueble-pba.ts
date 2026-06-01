/**
 * Calculadora de tributos por venta de inmueble en Argentina
 * - ITI Ley 23.905 Arts. 7-15 (1,5% nacional) + Decreto 1.097/85 + RG ARCA 4.190
 * - Sellos provinciales (PBA 3,6% / CABA 3,5% / Interior ~2%)
 *
 * Cobertura:
 *   - Persona física: ITI 1,5% sobre precio venta (salvo exención Art. 14: reemplazo
 *     vivienda única dentro de 12 meses).
 *   - Persona jurídica: NO paga ITI, paga Ganancias 35% sobre utilidad
 *     (Art. 73 Ley 20.628). Esta calc no estima la utilidad (precio compra no se
 *     pide como input); se informa el régimen en el mensaje.
 *
 * Para inmuebles adquiridos desde 1/1/2018 (Ley 27.430) aplica Ganancias
 * cedular 15% en lugar de ITI — la calc se enfoca en el ITI clásico y avisa al usuario.
 */

export type Provincia = 'PBA' | 'CABA' | 'Interior';
export type TipoVendedor = 'persona-fisica' | 'persona-juridica';
export type ExoneradoIti = 'si' | 'no';

export interface PlusvaliaInputs {
  precioVenta: number;
  exoneradoIti: ExoneradoIti;
  provinciaInmueble: Provincia;
  tipoVendedor: TipoVendedor;
}

export interface PlusvaliaOutputs {
  iti15Porciento: number;
  sellosCompraventa: number;
  totalTributos: number;
  percibeEscribano: string;
  mensaje: string;
  _chart?: any;
}

const SELLO_VENDEDOR: Record<Provincia, number> = {
  PBA: 0.018, // 1,8% (3,6% total / 2)
  CABA: 0.0175, // 1,75% (3,5% total / 2)
  Interior: 0.01, // 1% (2% promedio / 2)
};

const SELLO_LABEL: Record<Provincia, string> = {
  PBA: 'PBA (ARBA): 3,6% total, 1,8% vendedor',
  CABA: 'CABA (AGIP): 3,5% total, 1,75% vendedor',
  Interior: 'Interior: ~2% promedio, 1% vendedor (verificá tu provincia)',
};

export function plusvaliaInmueblePba(
  inputs: PlusvaliaInputs,
): PlusvaliaOutputs {
  const precio = Number(inputs.precioVenta);
  const exonerado: ExoneradoIti = inputs.exoneradoIti || 'no';
  const provincia: Provincia = inputs.provinciaInmueble || 'PBA';
  const tipoVendedor: TipoVendedor = inputs.tipoVendedor || 'persona-fisica';

  if (!precio || precio <= 0) {
    throw new Error('Ingresá el precio de venta del inmueble');
  }

  // ITI: 1,5% Ley 23.905 — solo persona física, si NO está exenta
  let iti15Porciento = 0;
  if (tipoVendedor === 'persona-fisica' && exonerado === 'no') {
    iti15Porciento = precio * 0.015;
  }

  // Sellos provinciales (parte del vendedor, ~50% del total)
  const tasaSelloVendedor = SELLO_VENDEDOR[provincia] ?? 0.018;
  const sellosCompraventa = precio * tasaSelloVendedor;

  const totalTributos = iti15Porciento + sellosCompraventa;

  // Mensajes contextuales
  let mensaje = '';
  let percibeEscribano = '';

  if (tipoVendedor === 'persona-juridica') {
    mensaje =
      'Como persona jurídica NO pagás ITI: pagás Ganancias 35% sobre la UTILIDAD ' +
      '(precio venta - costo computable - gastos, Art. 73 Ley 20.628). Esta ' +
      'calculadora NO estima la utilidad — calculala con tu contador. Lo único que ' +
      'estimamos son los sellos provinciales que sí pagás.';
    percibeEscribano =
      'Solo sellos. El ITI no aplica a personas jurídicas (Ganancias 35% sobre utilidad lo paga la sociedad por su cuenta).';
  } else if (exonerado === 'si') {
    mensaje =
      'EXENCIÓN: como reemplazás vivienda única dentro de 12 meses (Art. 14 Ley ' +
      '23.905), NO pagás ITI. Recordá tramitar el F. 145 en ARCA antes de la ' +
      'escritura y entregarle al escribano el Certificado de No Retención. Los ' +
      'sellos provinciales SÍ los pagás (la exención del Art. 14 es solo para ITI).';
    percibeEscribano =
      'Escribano NO retiene ITI (con F. 145 ARCA). Los sellos los pagás aparte en el organismo provincial.';
  } else {
    mensaje =
      'Pago normal: el escribano retiene el ITI (1,5%) y lo deposita en ARCA dentro ' +
      'de los 15 días corridos de la escritura. Los sellos los pagás en el ' +
      'organismo provincial (ARBA / AGIP / DGR) antes de escriturar. Si tu inmueble ' +
      'fue adquirido a partir del 1/1/2018, aplica Ganancias cedular 15% en lugar ' +
      'de ITI (Ley 27.430) — consultá esa calculadora.';
    percibeEscribano =
      `Escribano retiene ITI (${Math.round(iti15Porciento).toLocaleString('es-AR')} pesos) ` +
      `+ presenta los sellos. Sellos: ${SELLO_LABEL[provincia]}.`;
  }

  // Donut solo si hay ≥2 componentes reales (ITI + sellos). Si ITI=0
  // (persona jurídica o exención), el desglose es un único ítem → sin gráfico.
  const slicesTributos = [
    { label: 'ITI 1,5%', value: Math.round(iti15Porciento) },
    { label: 'Sellos', value: Math.round(sellosCompraventa) },
  ].filter((s) => s.value > 0);
  const chart =
    slicesTributos.length >= 2
      ? {
          type: 'doughnut' as const,
          slices: slicesTributos,
          prefix: '$',
          centerValue: '$' + Math.round(totalTributos).toLocaleString('es-AR'),
          centerLabel: 'Total tributos',
          ariaLabel: 'Composición de los tributos por venta: ITI nacional y sellos provinciales.',
        }
      : undefined;

  return {
    iti15Porciento: Math.round(iti15Porciento),
    sellosCompraventa: Math.round(sellosCompraventa),
    totalTributos: Math.round(totalTributos),
    percibeEscribano,
    mensaje,
    _chart: chart,
  };
}
