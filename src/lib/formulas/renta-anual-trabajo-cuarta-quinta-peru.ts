/**
 * Renta anual de trabajo Perú (4ta + 5ta categoría) — declaración anual.
 * - Renta de 4ta: se deduce el 20% (tope 24 UIT) sobre los honorarios brutos.
 * - Suma 4ta neta + 5ta bruta = renta bruta de trabajo.
 * - Deducción conjunta de 7 UIT + hasta 3 UIT adicionales por gastos deducibles.
 * - Tramos progresivos (8/14/17/20/30%) → impuesto anual.
 * - Menos retenciones y pagos a cuenta = saldo a favor (devolución) o por pagar.
 *
 * Base legal: arts. 33, 45, 46, 53 y 74 de la Ley del Impuesto a la Renta.
 * UIT 2026 = S/ 5.500 (importada de peru-2026).
 */
import { PERU_2026, impuestoRenta5taAnual, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  renta4ta: number;            // honorarios brutos del año (S/)
  renta5ta: number;            // sueldos brutos del año, incluidas gratificaciones (S/)
  retenciones?: number;        // retenciones + pagos a cuenta del año (S/)
  gastosDeducibles?: number;   // gastos deducibles adicionales (hasta 3 UIT) (S/)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const renta4ta = Number(i.renta4ta) || 0;
  const renta5ta = Number(i.renta5ta) || 0;
  const retenciones = Number(i.retenciones) || 0;
  const gastos = Number(i.gastosDeducibles) || 0;
  if (renta4ta <= 0 && renta5ta <= 0) throw new Error('Ingresá tu renta de 4ta y/o 5ta del año');

  const uit = PERU_2026.uit;

  // 4ta: deducción del 20% con tope de 24 UIT.
  const deduccion20 = Math.min(renta4ta * 0.20, 24 * uit);
  const renta4taNeta = renta4ta - deduccion20;

  // Renta bruta de trabajo (base antes de las 7 UIT).
  const rentaBrutaTrabajo = renta4taNeta + renta5ta;

  // Deducción adicional por gastos: tope 3 UIT.
  const deduccionAdicional = Math.min(Math.max(0, gastos), 3 * uit);

  // El helper impuestoRenta5taAnual descuenta internamente las 7 UIT y aplica los
  // tramos: pasándole (rentaBrutaTrabajo − deducciónAdicional) obtenemos el impuesto
  // sobre la base imponible correcta.
  const impuestoAnual = impuestoRenta5taAnual(rentaBrutaTrabajo - deduccionAdicional);
  const baseImponible = Math.max(0, rentaBrutaTrabajo - 7 * uit - deduccionAdicional);

  // Saldo: positivo = por pagar; negativo = a favor (devolución).
  const saldo = impuestoAnual - retenciones;
  const aFavor = saldo < 0;
  const tasaEfectiva = (renta4ta + renta5ta) > 0 ? impuestoAnual / (renta4ta + renta5ta) : 0;

  const _insight = {
    title: aFavor ? 'Tenés saldo a favor (devolución)' : (saldo > 0 ? 'Te queda impuesto por pagar' : 'Sin saldo pendiente'),
    text: impuestoAnual > 0
      ? `Tu renta bruta de trabajo es **${fmtPEN(rentaBrutaTrabajo)}** (4ta neta ${fmtPEN(renta4taNeta)} + 5ta ${fmtPEN(renta5ta)}). Tras las **7 UIT** (${fmtPEN(7 * uit)})${deduccionAdicional > 0 ? ` y **${fmtPEN(deduccionAdicional)}** de gastos deducibles` : ''}, la base imponible es **${fmtPEN(baseImponible)}** y el impuesto anual **${fmtPEN(impuestoAnual)}**. Con **${fmtPEN(retenciones)}** ya retenidos, ${aFavor ? `SUNAT te debería devolver **${fmtPEN(Math.abs(saldo))}**.` : `te queda por pagar **${fmtPEN(saldo)}**.`}`
      : `Con una renta bruta de trabajo de **${fmtPEN(rentaBrutaTrabajo)}** no superás las **7 UIT exentas** (${fmtPEN(7 * uit)}), así que **no pagás impuesto**. Si te retuvieron algo (${fmtPEN(retenciones)}), corresponde solicitar la **devolución**.`,
    tone: aFavor ? 'good' : (saldo > 0 ? 'warn' : 'neutral'),
    icon: '🧾',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Exento (7 UIT)', value: Math.round(Math.min(7 * uit, rentaBrutaTrabajo)) },
      { label: 'Base gravada (neta)', value: Math.round(Math.max(0, baseImponible - impuestoAnual)) },
      { label: 'Impuesto', value: Math.round(impuestoAnual) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(impuestoAnual),
    centerLabel: 'Impuesto anual',
    ariaLabel: `Impuesto anual de trabajo de ${fmtPEN(impuestoAnual)} sobre una renta bruta de ${fmtPEN(rentaBrutaTrabajo)}.`,
  };

  return {
    impuestoAnual: fmtPEN(impuestoAnual),
    baseImponible: fmtPEN(baseImponible),
    saldo: aFavor ? `A favor: ${fmtPEN(Math.abs(saldo))}` : (saldo > 0 ? `Por pagar: ${fmtPEN(saldo)}` : 'S/ 0'),
    rentaNetaTrabajo: fmtPEN(rentaBrutaTrabajo),
    tasaEfectiva: (tasaEfectiva * 100).toLocaleString('es-PE', { maximumFractionDigits: 1 }) + '%',
    detalle: `4ta ${fmtPEN(renta4ta)} − 20% (${fmtPEN(deduccion20)}) = ${fmtPEN(renta4taNeta)} · + 5ta ${fmtPEN(renta5ta)} = ${fmtPEN(rentaBrutaTrabajo)} · − 7 UIT (${fmtPEN(7 * uit)})${deduccionAdicional > 0 ? ` − gastos ${fmtPEN(deduccionAdicional)}` : ''} = base ${fmtPEN(baseImponible)} · impuesto ${fmtPEN(impuestoAnual)} − retenciones ${fmtPEN(retenciones)} = ${aFavor ? 'saldo a favor ' + fmtPEN(Math.abs(saldo)) : 'saldo por pagar ' + fmtPEN(Math.max(0, saldo))}.`,
    _insight,
    _chart,
  };
}
