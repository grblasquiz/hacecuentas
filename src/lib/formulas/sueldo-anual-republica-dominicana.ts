/**
 * Sueldo anual República Dominicana 2026 — cuánto ganás al año con la regalía pascual.
 *
 * En R. D. el ingreso anual NO son 12 sueldos sino ~13: a los 12 salarios
 * mensuales se suma la regalía pascual ("doble sueldo" de diciembre), que para un
 * sueldo fijo y año completo equivale a un mes más.
 *
 *   bruto anual = salario × 12 + regalía  (regalía = salario × 12 ÷ 12 = salario)
 *   neto anual  = 12 × netoMensual + regalía   (la regalía es EXENTA de ISR y TSS,
 *                 por eso se suma completa, sin descuentos)
 *
 * El neto mensual (descuento AFP 2,87% + SFS 3,04% + retención ISR) NO se calcula
 * a mano: usa salarioNetoDominicana de la data. La regalía no cotiza TSS ni paga
 * ISR (Ley 87-01 + Ley 16-92), por eso se acredita íntegra en el neto.
 */
import { REPUBLICA_DOMINICANA_2026, fmtDOP, salarioNetoDominicana, regaliaPascual } from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioMensual?: number; // salario bruto mensual (RD$)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function sueldoAnualRepublicaDominicana(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual) || 0;
  if (salario <= 0) throw new Error('Ingresá tu salario bruto mensual en RD$');

  // Desglose mensual (AFP + SFS + retención ISR) desde la data.
  const m = salarioNetoDominicana(salario);

  // Regalía pascual de un año completo = salario devengado (×12) ÷ 12 = un salario.
  const regalia = regaliaPascual(salario * 12);

  // Anual bruto: 12 sueldos + regalía.
  const brutoAnual = salario * 12 + regalia;

  // Anual neto: 12 netos mensuales + regalía completa (exenta de ISR y TSS).
  const tssAnual = m.tss * 12;
  const isrAnualMonto = m.isrMensual * 12;
  const netoAnual = m.neto * 12 + regalia;

  const totalSueldos = brutoAnual / salario; // ≈ 13

  const _table = {
    title: 'Tu sueldo: mensual vs anual',
    headers: ['Concepto', 'Mensual', 'Anual'],
    rows: [
      ['Salario bruto', fmtDOP(salario), fmtDOP(salario * 12)],
      ['Regalía pascual', '—', fmtDOP(regalia)],
      ['Bruto total', fmtDOP(salario), fmtDOP(brutoAnual)],
      ['(−) AFP + SFS (TSS)', fmtDOP(m.tss), fmtDOP(tssAnual)],
      ['(−) Retención ISR', fmtDOP(m.isrMensual), fmtDOP(isrAnualMonto)],
      ['Neto en mano', fmtDOP(m.neto), fmtDOP(netoAnual)],
    ],
    note: `El bruto anual son ${totalSueldos.toFixed(2)} sueldos (12 + la regalía pascual). La regalía es EXENTA de ISR y no cotiza TSS, por eso entra completa al neto anual. AFP 2,87% + SFS 3,04% y la retención de ISR se aplican sólo a los 12 salarios mensuales.`,
  };

  const _insight = {
    type: 'highlight',
    icon: '💰',
    text:
      `Con un salario de **${fmtDOP(salario)}** al mes, al año ganás **${fmtDOP(brutoAnual)}** brutos ` +
      `(${totalSueldos.toFixed(2)} sueldos: 12 + la regalía pascual de ${fmtDOP(regalia)}). ` +
      `En mano te quedan **${fmtDOP(netoAnual)}** netos, después de ${fmtDOP(tssAnual)} de TSS y ${fmtDOP(isrAnualMonto)} de ISR sobre los 12 salarios. ` +
      `La regalía la cobrás completa porque es exenta de ISR y no paga TSS.`,
  };

  return {
    brutoAnual: fmtDOP(brutoAnual),
    netoAnual: fmtDOP(netoAnual),
    brutoAnualMonto: Math.round(brutoAnual),
    netoAnualMonto: Math.round(netoAnual),
    regalia: Math.round(regalia),
    totalSueldos: Number(totalSueldos.toFixed(2)),
    detalle: `${fmtDOP(salario)} × 12 + regalía ${fmtDOP(regalia)} = ${fmtDOP(brutoAnual)} bruto · ${fmtDOP(netoAnual)} neto`,
    _table,
    _insight,
  };
}
