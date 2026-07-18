/**
 * IRPF por venta de inmueble — Uruguay 2026 (DGI, incremento patrimonial, Cat. I).
 *
 * El IRPF por incremento patrimonial grava la RENTA obtenida al vender un
 * inmueble con una tasa del 12%. Hay dos criterios para calcular esa renta:
 *
 *  - CRITERIO FICTO: sólo para inmuebles adquiridos ANTES del 1/7/2007. La renta
 *    se estima en un 15% del precio de venta → impuesto = 12% × 15% = 1,8% del
 *    precio. No requiere probar el costo de compra.
 *  - CRITERIO REAL: obligatorio para inmuebles adquiridos DESPUÉS del 1/7/2007.
 *    Renta = precio de venta − costo de adquisición actualizado − mejoras − ITP
 *    pagado en la compra; impuesto = 12% × max(0, renta).
 *
 * Para los adquiridos ANTES del 1/7/2007 se puede optar por el que dé MENOR
 * impuesto (ficto o real). El escribano interviniente actúa como agente de
 * retención y liquida el impuesto en la escritura.
 *
 * ⚠️ Cálculo orientativo. Existe una exoneración por venta de la vivienda
 * permanente cuando el importe se reinvierte en otra vivienda (condiciones DGI);
 * no se calcula acá. Verificá tu caso con la DGI o un escribano.
 */
import { IRPF_INMUEBLE_UY, fmtUYU } from '../data/uruguay-2026.ts';

export interface Inputs {
  /** Precio de venta del inmueble, en pesos. */
  precioVenta: number;
  /** Momento de la compra: 'antes-2007' o 'despues-2007' (por defecto). */
  fechaAdquisicion?: string;
  /** Valor de compra actualizado (para el criterio real). */
  costoAdquisicion?: number;
  /** Mejoras y reformas documentadas (criterio real). */
  mejoras?: number;
  /** ITP que pagaste al comprar el inmueble (criterio real). */
  itpCompra?: number;
}

export interface Outputs {
  impuesto: string;
  criterioAplicado: string;
  fictoImpuesto: string;
  realImpuesto: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const precio = Math.max(0, Number(i.precioVenta) || 0);
  const costo = Math.max(0, Number(i.costoAdquisicion) || 0);
  const mejoras = Math.max(0, Number(i.mejoras) || 0);
  const itp = Math.max(0, Number(i.itpCompra) || 0);
  const antes2007 = i.fechaAdquisicion === 'antes-2007';

  // Criterio ficto: renta = 15% del precio; impuesto = 12% de esa renta = 1,8% del precio.
  const fictoRenta = precio * IRPF_INMUEBLE_UY.fictoPorcentaje;
  const fictoImp = fictoRenta * IRPF_INMUEBLE_UY.tasa;

  // Criterio real: renta = precio − costo − mejoras − ITP compra; impuesto = 12% de la renta.
  const realRenta = Math.max(0, precio - costo - mejoras - itp);
  const realImp = realRenta * IRPF_INMUEBLE_UY.tasa;

  let impuesto: number;
  let criterio: string;
  if (antes2007) {
    // Adquirido antes del 1/7/2007: se puede optar por el que dé MENOS impuesto.
    if (fictoImp <= realImp) {
      impuesto = fictoImp;
      criterio = 'Ficto (1,8% del precio) — conviene sobre el real';
    } else {
      impuesto = realImp;
      criterio = 'Real (renta efectiva) — conviene sobre el ficto';
    }
  } else {
    // Adquirido después del 1/7/2007: criterio real obligatorio.
    impuesto = realImp;
    criterio = 'Real (obligatorio — adquirido después del 1/7/2007)';
  }

  const tasaEfectiva = precio > 0 ? (impuesto / precio) * 100 : 0;

  const detalle = antes2007
    ? `Inmueble adquirido antes del 1/7/2007 → podés elegir el criterio que pague menos. ` +
      `Ficto: ${fmtUYU(precio)} × 15% × 12% = ${fmtUYU(fictoImp)} (1,8% del precio). ` +
      (costo + mejoras + itp > 0
        ? `Real: renta ${fmtUYU(realRenta)} × 12% = ${fmtUYU(realImp)}. `
        : `Real: sin datos de costo/mejoras/ITP el criterio real da ${fmtUYU(realImp)} (poco realista sin costo). `) +
      `IRPF a retener por el escribano: ${fmtUYU(impuesto)} (${criterio}).`
    : `Inmueble adquirido después del 1/7/2007 → criterio real obligatorio. ` +
      `Renta = precio ${fmtUYU(precio)} − costo ${fmtUYU(costo)} − mejoras ${fmtUYU(mejoras)} − ITP compra ${fmtUYU(itp)} = ${fmtUYU(realRenta)}. ` +
      `IRPF = ${fmtUYU(realRenta)} × 12% = ${fmtUYU(impuesto)}. El escribano lo retiene en la escritura.`;

  return {
    impuesto: fmtUYU(impuesto),
    criterioAplicado: criterio,
    fictoImpuesto: fmtUYU(fictoImp),
    realImpuesto: fmtUYU(realImp),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🏘️',
      tone: 'info' as const,
      text: antes2007
        ? `Como compraste antes del **1/7/2007**, podés optar por el criterio que menos pague. ` +
          `Acá conviene el **${fictoImp <= realImp ? 'ficto' : 'real'}**: el IRPF queda en **${fmtUYU(impuesto)}** ` +
          `(el escribano lo retiene). El ficto siempre es el **1,8% del precio** y no exige probar el costo de compra.`
        : `Comprado después del **1/7/2007** va sí o sí por **criterio real**: 12% sobre la renta ` +
          `(precio − costo actualizado − mejoras − ITP). Con los datos ingresados, el IRPF es **${fmtUYU(impuesto)}** ` +
          `(tasa efectiva ${tasaEfectiva.toFixed(2)}% del precio). Cargá bien el costo: sin él la renta se infla y pagás de más.`,
    },
    _table: {
      title: 'IRPF ficto por venta de inmueble (1,8% del precio) — DGI',
      headers: ['Precio de venta', 'Renta ficta (15% del precio)', 'IRPF ficto (12% × 15% = 1,8%)'],
      rows: [3000000, 5000000, 8000000, 12000000, 20000000].map((p) => {
        const renta = p * IRPF_INMUEBLE_UY.fictoPorcentaje;
        const imp = renta * IRPF_INMUEBLE_UY.tasa;
        return [fmtUYU(p), fmtUYU(renta), fmtUYU(imp)];
      }),
      note:
        'El criterio ficto (renta = 15% del precio; impuesto = 1,8% del precio) sólo aplica a inmuebles adquiridos ' +
        'antes del 1/7/2007. Para los adquiridos después rige el criterio real (12% sobre precio − costo − mejoras − ITP). ' +
        'Estimación orientativa: la retención definitiva la liquida el escribano. Verificá en la DGI.',
    },
  };
}
