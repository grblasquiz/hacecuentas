/**
 * Calculadora de tributos por venta de inmueble en Argentina — régimen vigente 2026
 *
 * ⚠️ CAMBIO NORMATIVO CLAVE: el Impuesto a la Transferencia de Inmuebles (ITI,
 * Ley 23.905, 1,5%) fue DEROGADO por la Ley 27.743 ("Medidas Fiscales Paliativas
 * y Relevantes"), con vigencia desde el 8 de julio de 2024. Ya NO se paga ITI.
 *
 * Régimen vigente 2026 para PERSONAS FÍSICAS no habitualistas:
 *   - Inmueble adquirido ANTES del 1/1/2018 y vendido tras la derogación:
 *     NO tributa impuesto nacional (no hay ITI ni Cedular; sin retroactividad).
 *   - Inmueble adquirido DESDE el 1/1/2018: tributa Impuesto Cedular 15% sobre
 *     la GANANCIA (precio de venta − costo de adquisición actualizado), Ley 20.628
 *     (t.o. 2019), salvo exención por reemplazo de vivienda única.
 *
 * Para PERSONA JURÍDICA: paga Ganancias (escala 25%-35%, Art. 73 Ley 20.628)
 * sobre la utilidad; la calc no estima esa utilidad.
 *
 * Los SELLOS provinciales (PBA 3,6% / CABA 3,5% / Interior ~2%) NO fueron
 * derogados y siguen vigentes — los cobra cada provincia.
 *
 * Fuente: Ley 27.743 (B.O. 8/7/2024) que derogó la Ley 23.905; AFIP/ARCA
 * "Derogación del ITI"; Impuesto Cedular Ley 20.628.
 */

export type Provincia = 'PBA' | 'CABA' | 'Interior';
export type TipoVendedor = 'persona-fisica' | 'persona-juridica';
export type ExoneradoIti = 'si' | 'no';
export type FechaAdquisicion = 'antes-2018' | 'desde-2018';

export interface PlusvaliaInputs {
  precioVenta: number;
  fechaAdquisicion?: FechaAdquisicion;
  precioCompra?: number;
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
  _insight?: any;
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

// Impuesto Cedular a la venta de inmuebles adquiridos desde 1/1/2018
const ALICUOTA_CEDULAR = 0.15;

/** Trata '', null, undefined como ausente; devuelve número finito o undefined. */
function toNum(v: unknown): number | undefined {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function plusvaliaInmueblePba(
  inputs: PlusvaliaInputs,
): PlusvaliaOutputs {
  const precio = Number(inputs.precioVenta);
  const fechaAdq: FechaAdquisicion = inputs.fechaAdquisicion || 'antes-2018';
  const precioCompra = toNum(inputs.precioCompra);
  const exonerado: ExoneradoIti = inputs.exoneradoIti || 'no';
  const provincia: Provincia = inputs.provinciaInmueble || 'PBA';
  const tipoVendedor: TipoVendedor = inputs.tipoVendedor || 'persona-fisica';

  if (!precio || precio <= 0) {
    throw new Error('Ingresá el precio de venta del inmueble');
  }

  // Impuesto nacional a la ganancia inmobiliaria (output id histórico: iti15Porciento).
  // El ITI (Ley 23.905) está DEROGADO desde 8/7/2024 (Ley 27.743) → siempre 0.
  // Lo que puede aplicar es el Impuesto Cedular 15% para adquisiciones desde 2018.
  let impuestoNacional = 0;
  let baseCedular = 0;
  if (
    tipoVendedor === 'persona-fisica' &&
    fechaAdq === 'desde-2018' &&
    exonerado === 'no'
  ) {
    // Cedular = 15% sobre la ganancia (venta - costo). Si no se informa el costo,
    // no podemos estimar la ganancia → 0 y se avisa en el mensaje.
    if (precioCompra !== undefined && precio > precioCompra) {
      baseCedular = precio - precioCompra;
      impuestoNacional = baseCedular * ALICUOTA_CEDULAR;
    }
  }

  // Sellos provinciales (parte del vendedor, ~50% del total) — NO derogados
  const tasaSelloVendedor = SELLO_VENDEDOR[provincia] ?? 0.018;
  const sellosCompraventa = precio * tasaSelloVendedor;

  const totalTributos = impuestoNacional + sellosCompraventa;

  // Mensajes contextuales
  let mensaje = '';
  let percibeEscribano = '';

  if (tipoVendedor === 'persona-juridica') {
    mensaje =
      'El ITI fue DEROGADO (Ley 27.743, vigente desde 8/7/2024). Como persona ' +
      'jurídica pagás Impuesto a las Ganancias (escala 25%-35%, Art. 73 Ley ' +
      '20.628) sobre la UTILIDAD de la operación (precio venta - costo computable ' +
      '- gastos). Esta calculadora NO estima esa utilidad — liquidala con tu ' +
      'contador. Lo que sí estimamos son los sellos provinciales, que siguen vigentes.';
    percibeEscribano =
      'El escribano ya NO retiene ITI (derogado). La sociedad liquida Ganancias por su cuenta. Aparte, los sellos provinciales.';
  } else if (fechaAdq === 'antes-2018') {
    mensaje =
      'Buenas noticias: el ITI fue DEROGADO (Ley 27.743, desde 8/7/2024) y, como ' +
      'tu inmueble fue adquirido ANTES del 1/1/2018, tampoco entra en el Impuesto ' +
      'Cedular (no hay retroactividad). Por la venta NO pagás ningún impuesto ' +
      'nacional a la ganancia. Solo abonás los SELLOS provinciales sobre la ' +
      'compraventa.';
    percibeEscribano =
      'El escribano ya NO retiene ITI (derogado) ni Cedular (inmueble pre-2018). Solo se abonan los sellos provinciales antes de escriturar.';
  } else if (exonerado === 'si') {
    mensaje =
      'El ITI fue DEROGADO (Ley 27.743). Tu inmueble es post-2018, por lo que en ' +
      'principio iría al Impuesto Cedular 15%, pero estás EXENTO por reemplazo de ' +
      'vivienda única (Ley 20.628). Recordá acreditar el reemplazo ante ARCA. Los ' +
      'sellos provinciales SÍ los pagás (la exención no alcanza a los sellos).';
    percibeEscribano =
      'Sin impuesto nacional (Cedular exento por reemplazo de vivienda única). Los sellos los pagás aparte en el organismo provincial.';
  } else if (precioCompra === undefined) {
    mensaje =
      'El ITI fue DEROGADO (Ley 27.743). Tu inmueble es post-2018, así que la venta ' +
      'queda alcanzada por el Impuesto Cedular del 15% sobre la GANANCIA (precio de ' +
      'venta - costo de adquisición actualizado por IPC). Para estimarlo, ingresá el ' +
      'precio de compra. Si no lo cargás, solo mostramos los sellos provinciales.';
    percibeEscribano =
      'Cargá el precio de compra para estimar el Cedular 15% sobre la ganancia. Por ahora solo sellos provinciales.';
  } else {
    mensaje =
      'El ITI fue DEROGADO (Ley 27.743). Como tu inmueble es post-2018, la venta ' +
      'tributa el Impuesto Cedular del 15% sobre la GANANCIA (venta - costo). El ' +
      'costo idealmente se actualiza por IPC: esta estimación usa el precio de ' +
      'compra que ingresaste sin ajuste, así que el Cedular real puede ser menor. ' +
      'Los sellos provinciales se pagan aparte antes de escriturar.';
    percibeEscribano =
      `Cedular 15% estimado: ${Math.round(impuestoNacional).toLocaleString('es-AR')} pesos ` +
      `(sobre ganancia de ${Math.round(baseCedular).toLocaleString('es-AR')}). Sellos: ${SELLO_LABEL[provincia]}.`;
  }

  // Donut solo si hay ≥2 componentes reales (impuesto nacional + sellos).
  const labelNacional = fechaAdq === 'desde-2018' ? 'Cedular 15%' : 'Impuesto nacional';
  const slicesTributos = [
    { label: labelNacional, value: Math.round(impuestoNacional) },
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
          ariaLabel: 'Composición de los tributos por venta: impuesto nacional a la ganancia y sellos provinciales.',
        }
      : undefined;

  const totalRed = Math.round(totalTributos);
  const nacionalRed = Math.round(impuestoNacional);
  const sellosRed = Math.round(sellosCompraventa);
  const pctSobrePrecio = precio > 0 ? (totalTributos / precio) * 100 : 0;
  let insightText: string;
  if (tipoVendedor === 'persona-juridica') {
    insightText = `El **ITI está derogado**. Como **persona jurídica**, lo que estimamos son los **sellos provinciales** por **$${sellosRed.toLocaleString('es-AR')}**. La Ganancia (escala 25%-35% sobre la utilidad) la liquida la sociedad aparte con tu contador.`;
  } else if (fechaAdq === 'antes-2018') {
    insightText = `Con el **ITI derogado** (Ley 27.743) y tu inmueble **pre-2018**, NO pagás impuesto nacional a la ganancia. El único costo tributario son los **sellos provinciales**: **$${sellosRed.toLocaleString('es-AR')}**.`;
  } else if (exonerado === 'si') {
    insightText = `**ITI derogado** + **exención cedular** por reemplazo de vivienda única: no pagás impuesto nacional. Solo **$${sellosRed.toLocaleString('es-AR')}** de sellos provinciales.`;
  } else if (nacionalRed > 0) {
    insightText = `Inmueble **post-2018**: vas a pagar unos **$${totalRed.toLocaleString('es-AR')}** (**${pctSobrePrecio.toFixed(1)}%** del precio): **$${nacionalRed.toLocaleString('es-AR')}** de Cedular 15% sobre la ganancia y **$${sellosRed.toLocaleString('es-AR')}** de sellos provinciales.`;
  } else {
    insightText = `El **ITI está derogado**. Tu inmueble es post-2018 (Cedular 15%): cargá el **precio de compra** para estimar el impuesto sobre la ganancia. Por ahora, **$${sellosRed.toLocaleString('es-AR')}** de sellos provinciales.`;
  }
  const insight = {
    title: 'Lo que se lleva la operación',
    text: insightText,
    tone: 'warn' as const,
    icon: '🏠',
  };

  return {
    iti15Porciento: nacionalRed,
    sellosCompraventa: sellosRed,
    totalTributos: totalRed,
    percibeEscribano,
    mensaje,
    _chart: chart,
    _insight: insight,
  };
}
