/**
 * Sanción / indemnización moratoria por no pago oportuno de la liquidación — Colombia (art. 65 CST).
 * Cuando el empleador no paga salarios y prestaciones al terminar el contrato, debe al trabajador
 * un día de salario por cada día de retardo. Para quien devengaba MÁS de 1 SMLMV el conteo tiene
 * tope de 24 meses (720 días); a partir de ahí corren intereses moratorios a la tasa máxima
 * certificada por la Superfinanciera. Para quien devengaba 1 SMLMV o menos, corre 1 día por día
 * sin ese tope. SMLMV importado de la tabla maestra (NO hardcodear).
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number;
  diasRetardo: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function num(v: any): number {
  if (v === undefined || v === null || v === '') return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

const TOPE_DIAS = 720; // 24 meses — tope del inciso 2 del art. 65 CST para salarios > 1 SMLMV.

export function compute(i: Inputs): Outputs {
  const salario = num(i.salarioMensual);
  if (!Number.isFinite(salario) || salario <= 0) {
    throw new Error('Ingresá el salario mensual que devengaba el trabajador (COP)');
  }
  let dias = num(i.diasRetardo);
  if (!Number.isFinite(dias) || dias < 0) dias = 0;
  dias = Math.floor(dias);

  const smlmv = COLOMBIA_2026.smlmv;
  const salarioDiario = salario / 30;
  const superaMinimo = salario > smlmv;

  let diasComputados: number;
  let faseIntereses: string;

  if (superaMinimo) {
    diasComputados = Math.min(dias, TOPE_DIAS);
    faseIntereses = dias > TOPE_DIAS
      ? `Superaste el tope de 720 días (24 meses). Por los ${dias - TOPE_DIAS} días adicionales ya no corre 1 día de salario por día: sobre las sumas adeudadas corren intereses moratorios a la tasa máxima de créditos de libre asignación certificada por la Superintendencia Financiera (art. 65 CST, inciso 2).`
      : `Todavía no llegás al tope de 720 días (24 meses): hasta ahí corre 1 día de salario por cada día de mora. Al superarlo, se pasa a intereses moratorios.`;
  } else {
    diasComputados = dias; // salario ≤ 1 SMLMV: sin el tope de 24 meses del inciso 2.
    faseIntereses = `El salario es igual o menor a 1 SMLMV (${fmtCOP(smlmv)} en 2026): la indemnización corre a razón de 1 día de salario por cada día de retardo, sin el tope de 24 meses que aplica a salarios superiores.`;
  }

  const sancion = Math.round(salarioDiario * diasComputados);

  const _insight = {
    title: `Sanción moratoria estimada: ${fmtCOP(sancion)}`,
    text: `Con un salario de **${fmtCOP(salario)}** el día de salario vale **${fmtCOP(salarioDiario)}**. Por **${diasComputados} día(s)** computados de mora, la indemnización del art. 65 CST asciende a **${fmtCOP(sancion)}**. ${superaMinimo ? `El tope aplicable es de 720 días (24 meses).` : `Al ser 1 SMLMV o menos, no aplica el tope de 24 meses.`} Esta sanción no es automática: la reconoce un juez laboral y puede exonerarse si el empleador prueba buena fe.`,
    tone: 'warn',
    icon: '⚖️',
  };

  const _chart = {
    type: 'bar',
    labels: ['Salario mensual', 'Sanción moratoria'],
    values: [Math.round(salario), sancion],
    prefix: '$',
    ariaLabel: `Salario mensual ${fmtCOP(salario)} frente a la sanción moratoria estimada de ${fmtCOP(sancion)} por ${diasComputados} días de retardo.`,
  };

  return {
    salarioDiario: fmtCOP(salarioDiario),
    diasComputados: `${diasComputados} día(s)` + (superaMinimo && dias > TOPE_DIAS ? ` (de ${dias} de mora; tope 720)` : ''),
    sancionMoratoria: fmtCOP(sancion),
    faseIntereses,
    detalle: `${fmtCOP(salario)} ÷ 30 = ${fmtCOP(salarioDiario)} por día × ${diasComputados} día(s) = ${fmtCOP(sancion)}. ${superaMinimo ? 'Salario > 1 SMLMV: tope de 720 días (24 meses).' : 'Salario ≤ 1 SMLMV: sin tope de 24 meses.'}`,
    _insight,
    _chart,
  };
}
