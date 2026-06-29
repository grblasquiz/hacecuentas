/** Devolución de Renta de 5ta categoría Perú — deducción 7 UIT + deducción
 *  adicional (gastos art. 46 LIR, tope 3 UIT) y tramos progresivos (art. 53 LIR).
 *  La devolución es el exceso retenido por el empleador sobre el impuesto real. */
import { PERU_2026 } from '../data/peru-2026.ts';
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  ingresoAnual: number;        // ingreso anual bruto de 5ta (12 sueldos + 2 grati)
  retenido: number;            // total retenido por el empleador en el año
  gastoRestaurantes?: number;  // gastos en restaurantes/hoteles (deduce 15%)
  gastoAlquiler?: number;      // alquiler de vivienda (deduce 30%)
  gastoMedicos?: number;       // honorarios médicos/odontólogos (deduce 30%)
  uit?: number;                // UIT vigente (default S/ 5.500)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Impuesto de 5ta categoría sobre una base ya neta de deducciones (7 UIT y adicional).
 *  Tramos del art. 53 LIR expresados en UIT acumuladas. (definido como const para
 *  que el primer `export function` del archivo sea `compute`, que es lo que el
 *  registro de fórmulas espera por formulaId). */
export const tramos5ta = (base: number, uit: number): number => {
  if (base <= 0) return 0;
  const tramos = [
    { hastaUit: 5, tasa: 0.08 },
    { hastaUit: 20, tasa: 0.14 },
    { hastaUit: 35, tasa: 0.17 },
    { hastaUit: 45, tasa: 0.20 },
    { hastaUit: Infinity, tasa: 0.30 },
  ];
  let restante = base;
  let anterior = 0;
  let impuesto = 0;
  for (const t of tramos) {
    const limite = t.hastaUit === Infinity ? Infinity : t.hastaUit * uit;
    const ancho = limite - anterior;
    const enTramo = Math.min(restante, ancho);
    if (enTramo <= 0) break;
    impuesto += enTramo * t.tasa;
    restante -= enTramo;
    anterior = limite;
    if (restante <= 0) break;
  }
  return impuesto;
};

export function compute(i: Inputs): Outputs {
  const ingresoAnual = Number(i.ingresoAnual) || 0;
  const retenido = Number(i.retenido) || 0;
  const gRest = Number(i.gastoRestaurantes) || 0;
  const gAlq = Number(i.gastoAlquiler) || 0;
  const gMed = Number(i.gastoMedicos) || 0;
  const uit = Number(i.uit) || PERU_2026.uit;
  if (ingresoAnual <= 0) throw new Error('Ingresá tu ingreso anual bruto de 5ta categoría');

  const ded7UIT = 7 * uit;
  const topeAdic = 3 * uit;
  const dedAdic = Math.min(0.15 * gRest + 0.30 * gAlq + 0.30 * gMed, topeAdic);
  const baseNueva = Math.max(ingresoAnual - ded7UIT - dedAdic, 0);
  const impuestoNuevo = tramos5ta(baseNueva, uit);
  const devolucion = Math.max(retenido - impuestoNuevo, 0);

  const _insight = {
    title: devolucion > 0 ? 'Te corresponde devolución' : 'No hay devolución',
    text: devolucion > 0
      ? `Con tu ingreso de **${fmtPEN(ingresoAnual)}**, descontando 7 UIT (${fmtPEN(ded7UIT)}) y deducción adicional por gastos (${fmtPEN(dedAdic)}), tu impuesto real es **${fmtPEN(impuestoNuevo)}**. Como te retuvieron **${fmtPEN(retenido)}**, SUNAT te debería devolver **${fmtPEN(devolucion)}**.`
      : `Tu impuesto real es **${fmtPEN(impuestoNuevo)}** y te retuvieron **${fmtPEN(retenido)}**: no hay saldo a favor (incluso podrías deber la diferencia).`,
    tone: devolucion > 0 ? 'good' : 'warn',
    icon: '💸',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Impuesto real', value: Math.round(impuestoNuevo) },
      { label: 'Devolución', value: Math.round(devolucion) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(devolucion),
    centerLabel: 'Devolución',
    ariaLabel: `Devolución estimada de ${fmtPEN(devolucion)}.`,
  };

  return {
    deduccionAdicional: fmtPEN(dedAdic),
    impuestoNuevo: fmtPEN(impuestoNuevo),
    devolucion: fmtPEN(devolucion),
    detalle: `Base imponible ${fmtPEN(baseNueva)} (${fmtPEN(ingresoAnual)} − 7 UIT − ${fmtPEN(dedAdic)}) · impuesto ${fmtPEN(impuestoNuevo)} · retenido ${fmtPEN(retenido)} → devolución ${fmtPEN(devolucion)}.`,
    _insight,
    _chart,
  };
}
