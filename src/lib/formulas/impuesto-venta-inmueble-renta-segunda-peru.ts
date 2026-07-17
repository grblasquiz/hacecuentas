/**
 * Impuesto por venta de inmueble — renta de 2da categoría (ganancia de capital) Perú.
 * Tasa efectiva: 5% de la ganancia = venta − costo computable actualizado.
 * (Técnicamente 6,25% sobre la renta neta, que equivale al 5% de la ganancia bruta.)
 *
 * Costo computable = valor de adquisición × Índice de Corrección Monetaria (ICM)
 * que publica el MEF cada mes. Exenciones: casa habitación (posesión ≥ 2 años como
 * vivienda del enajenante) e inmuebles adquiridos antes del 01/01/2004.
 *
 * Base legal: arts. 2, 21, 36, 52-A y 84-A de la Ley del Impuesto a la Renta.
 * CONTENIDO INFORMATIVO — no reemplaza asesoría tributaria profesional.
 */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  valorVenta: number;         // precio de venta del inmueble (S/)
  costoAdquisicion: number;   // valor de adquisición original (S/)
  factorICM?: number;         // Índice de Corrección Monetaria (MEF) — default 1
  esCasaHabitacion?: string;  // 'si' = tu casa habitación (posible exención)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const venta = Number(i.valorVenta) || 0;
  const costoBase = Number(i.costoAdquisicion) || 0;
  const icm = Number(i.factorICM) > 0 ? Number(i.factorICM) : 1;
  const casaHabitacion = String(i.esCasaHabitacion || 'no') === 'si';
  if (venta <= 0) throw new Error('Ingresá el precio de venta del inmueble');

  const costoComputable = costoBase * icm; // costo actualizado por el ICM del MEF
  const gananciaBruta = Math.max(0, venta - costoComputable);

  const TASA = 0.05; // 5% efectivo sobre la ganancia
  // Exención de casa habitación: no genera impuesto de 2da categoría.
  const impuesto = casaHabitacion ? 0 : gananciaBruta * TASA;
  const netoVendedor = venta - impuesto;

  const _insight = {
    title: casaHabitacion ? 'Venta exonerada (casa habitación)' : (gananciaBruta > 0 ? 'Pagás 5% sobre la ganancia' : 'Sin ganancia gravada'),
    text: casaHabitacion
      ? `Si el inmueble califica como tu **casa habitación** (lo tuviste al menos **2 años** como vivienda y no es de un negocio inmobiliario), la venta **no paga** el Impuesto a la Renta de 2da categoría. Igual conservá la documentación que acredite la condición.`
      : gananciaBruta > 0
        ? `Vendés en **${fmtPEN(venta)}** con un costo computable actualizado de **${fmtPEN(costoComputable)}**: la ganancia es **${fmtPEN(gananciaBruta)}** y el impuesto de 2da categoría es **${fmtPEN(impuesto)}** (5%). Es un **pago definitivo** que se abona con el formulario correspondiente dentro del mes siguiente a la venta.`
        : `Con un costo computable de **${fmtPEN(costoComputable)}** igual o mayor al precio de venta (**${fmtPEN(venta)}**) no hay ganancia gravada, así que no se genera impuesto de 2da categoría.`,
    tone: casaHabitacion ? 'good' : (impuesto > 0 ? 'warn' : 'neutral'),
    icon: '🏘️',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Costo computable', value: Math.round(Math.min(costoComputable, venta)) },
      { label: 'Ganancia neta', value: Math.round(Math.max(0, gananciaBruta - impuesto)) },
      { label: 'Impuesto (5%)', value: Math.round(impuesto) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(impuesto),
    centerLabel: 'Impuesto',
    ariaLabel: `Impuesto de segunda categoría de ${fmtPEN(impuesto)} sobre una ganancia de ${fmtPEN(gananciaBruta)}.`,
  };

  return {
    impuesto: fmtPEN(impuesto),
    ganancia: fmtPEN(gananciaBruta),
    costoComputable: fmtPEN(costoComputable),
    netoVendedor: fmtPEN(netoVendedor),
    exonerado: casaHabitacion ? 'Sí (casa habitación)' : 'No',
    detalle: casaHabitacion
      ? `Casa habitación: venta exonerada del Impuesto a la Renta de 2da categoría. Ganancia estimada ${fmtPEN(gananciaBruta)} (venta ${fmtPEN(venta)} − costo computable ${fmtPEN(costoComputable)}).`
      : `Venta ${fmtPEN(venta)} − costo computable ${fmtPEN(costoComputable)} (adquisición ${fmtPEN(costoBase)} × ICM ${icm.toLocaleString('es-PE', { maximumFractionDigits: 3 })}) = ganancia ${fmtPEN(gananciaBruta)} × 5% = ${fmtPEN(impuesto)}.`,
    _insight,
    _chart,
  };
}
