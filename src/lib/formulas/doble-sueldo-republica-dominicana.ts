/**
 * Calculadora de doble sueldo / salario de Navidad — República Dominicana 2026
 * (Arts. 219-222, Código de Trabajo, Ley 16-92). También llamada "regalía pascual".
 *
 *   doble sueldo = (salario ordinario devengado en el año + comisiones) ÷ 12
 *
 * Para un sueldo fijo y año completo equivale a un mes de salario. Se paga antes
 * del 20 de diciembre, está EXENTA del ISR y NO cotiza a la TSS (se cobra completa).
 * NO incluye horas extra, nocturnidad ni propinas. Tope legal: 5 salarios mínimos.
 */
import {
  REPUBLICA_DOMINICANA_2026 as RD,
  fmtDOP,
} from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioMensual: number;
  /** Comisiones ordinarias devengadas en el año (forman parte del salario). Default 0. */
  comisionAnual: number;
  /** Meses trabajados en el año (1 a 12). Default 12 = año completo. */
  mesesTrabajados: number;
}

export interface Outputs {
  dobleSueldo: number | string;
  dobleSueldoBruto: number;
  salarioAnual: number;
  mesesTrabajados: number;
  tope: number;
  topeAplicado: boolean;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
}

export function dobleSueldoRepublicaDominicana(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual);
  const comisionAnual = Math.max(0, Number(i.comisionAnual) || 0);
  const meses = Math.max(1, Math.min(12, Math.floor(i.mesesTrabajados == null ? 12 : Number(i.mesesTrabajados))));

  if (!salario || salario <= 0) throw new Error('Ingresá tu salario mensual en RD$');

  const salarioAnual = salario * meses + comisionAnual;
  const dobleSueldoBruto = salarioAnual / 12;

  // Tope legal: 5 salarios mínimos (Art. 219). Referencia: salario mínimo del
  // sector privado no sectorizado para empresas grandes.
  const salarioMinimoRef = RD.salarioMinimo.noSectorizado.grande;
  const tope = salarioMinimoRef * RD.laboral.regaliaPascual.topeSalariosMinimos;
  const topeAplicado = dobleSueldoBruto > tope;
  const dobleSueldo = topeAplicado ? tope : dobleSueldoBruto;

  const formula =
    `Doble sueldo = (${fmtDOP(salario)} × ${meses}` +
    (comisionAnual > 0 ? ` + ${fmtDOP(comisionAnual)} comisiones` : ``) +
    `) ÷ 12 = ${fmtDOP(dobleSueldoBruto)}`;

  const explicacion =
    `Salario ordinario devengado en el año = ${fmtDOP(salario)} × ${meses} meses` +
    (comisionAnual > 0 ? ` + ${fmtDOP(comisionAnual)} en comisiones` : ``) +
    ` = ${fmtDOP(salarioAnual)}. ` +
    `Doble sueldo (salario de Navidad) = ${fmtDOP(salarioAnual)} ÷ 12 = ${fmtDOP(dobleSueldoBruto)}. ` +
    (topeAplicado
      ? `Supera el tope legal de 5 salarios mínimos (${fmtDOP(tope)}), así que se limita a ${fmtDOP(tope)}. `
      : ``) +
    `Se paga antes del 20 de diciembre, EXENTO del ISR y sin descuentos de la TSS: se cobra completo. ` +
    `${meses === 12 ? 'Por ser un año completo, equivale a un mes de salario.' : `Como trabajaste ${meses} meses, recibís la parte proporcional.`}`;

  const _insight = {
    title: `Tu doble sueldo es ${fmtDOP(dobleSueldo)}`,
    text:
      meses === 12 && comisionAnual === 0
        ? `Con un año completo a **${fmtDOP(salario)}**, tu salario de Navidad es de **${fmtDOP(dobleSueldo)}** ` +
          `(un mes de sueldo). Se paga antes del 20 de diciembre, **exento de ISR y sin descuentos de TSS**.`
        : `Con **${meses} meses** trabajados a **${fmtDOP(salario)}**` +
          (comisionAnual > 0 ? ` más **${fmtDOP(comisionAnual)}** en comisiones` : ``) +
          `, tu doble sueldo es **${fmtDOP(dobleSueldo)}** = ${fmtDOP(salarioAnual)} ÷ 12. ` +
          `Va **exento de ISR y sin TSS**.`,
    tone: 'good' as 'good' | 'warn' | 'neutral',
    icon: '🎄',
  };

  const _table = {
    title: 'Cálculo de tu doble sueldo (salario de Navidad)',
    headers: ['Concepto', 'Monto'],
    align: ['left', 'right'],
    rows: [
      ['Salario mensual', fmtDOP(salario)],
      ['Meses trabajados en el año', String(meses)],
      ['Comisiones del año', fmtDOP(comisionAnual)],
      ['Salario anual computable', fmtDOP(salarioAnual)],
      ['÷ 12', fmtDOP(dobleSueldoBruto)],
      ['Descuentos (ISR + TSS)', 'RD$ 0,00 (exento)'],
    ],
    footer: ['Doble sueldo a cobrar', fmtDOP(dobleSueldo)],
    note: 'Arts. 219-222 del Código de Trabajo. Exento de ISR y no cotizable a la TSS. Pago antes del 20 de diciembre. No incluye horas extra ni propinas.',
  };

  return {
    dobleSueldo: fmtDOP(dobleSueldo) + ' · exento de ISR y TSS',
    dobleSueldoBruto: Math.round(dobleSueldoBruto),
    salarioAnual: Math.round(salarioAnual),
    mesesTrabajados: meses,
    tope: Math.round(tope),
    topeAplicado,
    formula,
    explicacion,
    _insight,
    _table,
  };
}
