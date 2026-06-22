/**
 * Calculadora de regalía pascual / doble sueldo — República Dominicana 2026
 * (Art. 219, Ley 16-92). También llamada "salario de Navidad".
 *   Regalía = (salario ordinario devengado en el año) ÷ 12.
 * Para un sueldo fijo y año completo equivale a un mes de salario.
 * EXENTA de ISR y NO cotizable a la TSS. Tope: 5 salarios mínimos.
 */
import {
  REPUBLICA_DOMINICANA_2026 as RD,
  fmtDOP,
  regaliaPascual,
} from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioMensual: number;
  /** Meses trabajados en el año (1 a 12). Default 12 = año completo. */
  meses: number;
}

export interface Outputs {
  regalia: number | string;
  regaliaBruta: number;
  devengado: number;
  meses: number;
  tope: number;
  topeAplicado: boolean;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
}

export function regaliaPascualRepublicaDominicana(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual);
  const meses = Math.max(1, Math.min(12, Math.floor(i.meses == null ? 12 : Number(i.meses))));

  if (!salario || salario <= 0) throw new Error('Ingresá tu salario mensual en RD$');

  const devengado = salario * meses;
  const regaliaBruta = regaliaPascual(devengado);

  // Tope legal: 5 salarios mínimos (Art. 219). Usamos el salario mínimo del sector
  // privado no sectorizado grande como referencia del tope superior.
  const salarioMinimoRef = RD.salarioMinimo.noSectorizado.grande;
  const tope = salarioMinimoRef * RD.laboral.regaliaPascual.topeSalariosMinimos;
  const topeAplicado = regaliaBruta > tope;
  const regalia = topeAplicado ? tope : regaliaBruta;

  const formula = `Regalía = (${fmtDOP(salario)} × ${meses} meses) ÷ 12 = ${fmtDOP(regaliaBruta)}`;

  const explicacion =
    `Salario devengado en el año = ${fmtDOP(salario)} × ${meses} meses = ${fmtDOP(devengado)}. ` +
    `Regalía pascual = ${fmtDOP(devengado)} ÷ 12 = ${fmtDOP(regaliaBruta)}. ` +
    (topeAplicado
      ? `Supera el tope legal de 5 salarios mínimos (${fmtDOP(tope)}), así que se limita a ${fmtDOP(tope)}. `
      : ``) +
    `La regalía está EXENTA del ISR y NO cotiza a la TSS: se cobra completa, sin descuentos. ` +
    `${meses === 12 ? 'Por ser un año completo, equivale a un mes de salario.' : `Como trabajaste ${meses} meses, recibís la parte proporcional.`}`;

  const _insight = {
    title: `Tu regalía pascual es ${fmtDOP(regalia)}`,
    text:
      meses === 12
        ? `Con un año completo a **${fmtDOP(salario)}**, tu regalía es de **${fmtDOP(regalia)}** (un mes de sueldo). Se paga antes del 20 de diciembre, **exenta de ISR y sin descuentos de TSS**.`
        : `Con **${meses} meses** trabajados a **${fmtDOP(salario)}**, tu regalía proporcional es **${fmtDOP(regalia)}** = (${fmtDOP(salario)} × ${meses}) ÷ 12. Va **exenta de ISR y sin TSS**.`,
    tone: 'good' as 'good' | 'warn' | 'neutral',
    icon: '🎄',
  };

  const _table = {
    title: 'Cálculo de tu regalía pascual',
    headers: ['Concepto', 'Monto'],
    align: ['left', 'right'],
    rows: [
      ['Salario mensual', fmtDOP(salario)],
      ['Meses trabajados en el año', String(meses)],
      ['Devengado del año', fmtDOP(devengado)],
      ['÷ 12', fmtDOP(regaliaBruta)],
      ['Descuentos (ISR + TSS)', 'RD$ 0,00 (exenta)'],
    ],
    footer: ['Regalía a cobrar', fmtDOP(regalia)],
    note: 'Art. 219 del Código de Trabajo. Exenta de ISR y no cotizable a la TSS. Pago antes del 20 de diciembre.',
  };

  return {
    regalia: fmtDOP(regalia) + ' · exenta de ISR y TSS',
    regaliaBruta: Math.round(regaliaBruta),
    devengado: Math.round(devengado),
    meses,
    tope: Math.round(tope),
    topeAplicado,
    formula,
    explicacion,
    _insight,
    _table,
  };
}
