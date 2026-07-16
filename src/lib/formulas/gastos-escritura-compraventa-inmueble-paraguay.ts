/**
 * Gastos de escrituración / compraventa de inmueble — PARAGUAY.
 *
 * Al comprar una propiedad, la escritura pública la hace un escribano y se inscribe
 * en la Dirección General de los Registros Públicos. Los costos del comprador:
 *
 *  1. Honorario del escribano — Arancel del Notario Público (Ley 1307/87): escala
 *     decreciente del 2% al 0,75% según el monto, con mínimo de 5 jornales, + IVA 10%.
 *  2. Tasa de inscripción en los Registros Públicos — ~0,8% del valor.
 *  3. Impuesto/tasa municipal de transferencia — ~0,3% del valor.
 *
 * Por costumbre en Paraguay los gastos de escrituración los paga el comprador, pero
 * es negociable. La venta de inmuebles tributa IVA al 5% (a cargo del vendedor/
 * desarrollador cuando corresponde), que NO forma parte de estos gastos del comprador.
 * Moneda: guaraníes (PYG).
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026.ts';

// Escala del arancel notarial (Ley 1307/87): % decreciente según el valor.
function tasaNotarial(valor: number): number {
  if (valor <= 50_000_000) return 0.02;
  if (valor <= 75_000_000) return 0.0175;
  if (valor <= 100_000_000) return 0.015;
  if (valor <= 150_000_000) return 0.0125;
  if (valor <= 200_000_000) return 0.01;
  return 0.0075;
}

const TASA_INSCRIPCION = 0.008; // ~0,8% (Registros Públicos)
const IMPUESTO_MUNICIPAL = 0.003; // ~0,3% (transferencia municipal)

export interface Inputs {
  valorInmueble: number; // precio / valor de la operación, en Gs.
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const valor = Number(i.valorInmueble) || 0;
  if (valor <= 0) throw new Error('Ingresá el valor del inmueble');

  const rate = tasaNotarial(valor);
  const minimo = 5 * PARAGUAY_2026.jornalMinimo;
  const honorarioBase = Math.max(valor * rate, minimo);
  const iva = honorarioBase * PARAGUAY_2026.iva.general; // 10%
  const honorarioConIva = Math.round(honorarioBase + iva);

  const inscripcion = Math.round(valor * TASA_INSCRIPCION);
  const municipal = Math.round(valor * IMPUESTO_MUNICIPAL);
  const costoTotal = honorarioConIva + inscripcion + municipal;
  const pctSobreValor = (costoTotal / valor) * 100;

  const _table = {
    title: 'Desglose de los gastos de escrituración',
    headers: ['Concepto', 'Base', 'Monto'],
    rows: [
      [`Honorario escribano (${(rate * 100).toLocaleString('de-DE')}% + IVA)`, `${fmtPYG(valor)} × ${(rate * 100).toLocaleString('de-DE')}%`, fmtPYG(honorarioConIva)],
      ['Inscripción Registros Públicos', `${fmtPYG(valor)} × 0,8%`, fmtPYG(inscripcion)],
      ['Impuesto/tasa municipal', `${fmtPYG(valor)} × 0,3%`, fmtPYG(municipal)],
      ['Costo total estimado', `≈ ${pctSobreValor.toFixed(1)}% del valor`, fmtPYG(costoTotal)],
    ],
    note: 'Honorario del escribano según arancel Ley 1307/87 (mínimo 5 jornales) + IVA 10%. La inscripción y el impuesto municipal son referenciales; el escribano puede sumar fojas, certificados y sellados. El IVA 5% de la venta lo asume el vendedor cuando corresponde.',
  };

  const _insight = {
    type: 'highlight',
    icon: '🏡',
    text: `Escriturar una propiedad de **${fmtPYG(valor)}** cuesta alrededor de **${fmtPYG(costoTotal)}** (~${pctSobreValor.toFixed(1)}% del valor): honorario del escribano con IVA (${fmtPYG(honorarioConIva)}), inscripción en Registros Públicos (${fmtPYG(inscripcion)}) e impuesto municipal (${fmtPYG(municipal)}). Por costumbre los paga el comprador.`,
  };

  return {
    honorarioEscribano: fmtPYG(honorarioConIva),
    tasaInscripcion: fmtPYG(inscripcion),
    impuestoMunicipal: fmtPYG(municipal),
    costoTotal: fmtPYG(costoTotal),
    detalle: `Honorario ${fmtPYG(honorarioConIva)} (con IVA) + inscripción ${fmtPYG(inscripcion)} + municipal ${fmtPYG(municipal)} = ${fmtPYG(costoTotal)} (~${pctSobreValor.toFixed(1)}% del valor).`,
    _insight,
    _table,
  };
}
