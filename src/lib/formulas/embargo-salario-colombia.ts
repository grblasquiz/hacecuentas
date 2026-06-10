/**
 * Embargo de salario Colombia — CST arts. 154 a 156:
 * - El salario mínimo (SMLMV) es inembargable por deudas comunes.
 * - Deuda común: sólo es embargable la quinta parte (1/5) de lo que exceda el SMLMV.
 * - Pensión alimenticia y cooperativas: hasta el 50% de TODO el salario, incluso el mínimo.
 * Constantes y helper salarioEmbargable: src/lib/data/colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP, salarioEmbargable } from '../data/colombia-2026.ts';

export interface Inputs {
  salario: number;     // salario mensual en COP
  tipoDeuda?: string;  // 'comun' (default) | 'alimentos_cooperativas'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const salario = Number(i.salario) || 0;
  const tipo = String(i.tipoDeuda ?? 'comun') === 'alimentos_cooperativas' ? 'alimentos_cooperativas' : 'comun';
  if (salario <= 0) throw new Error('Ingresá tu salario mensual en pesos');

  const esAlimentos = tipo === 'alimentos_cooperativas';
  const embargable = salarioEmbargable(salario, tipo as 'comun' | 'alimentos_cooperativas');
  const libre = salario - embargable;
  const excedente = Math.max(0, salario - C.smlmv);
  const pct = salario > 0 ? (embargable / salario) * 100 : 0;

  const regla = esAlimentos
    ? `Hasta el ${(C.embargo.topeAlimentosCooperativas * 100).toFixed(0)}% de todo el salario (incluso del mínimo) por pensión alimenticia o deudas con cooperativas (art. 156 CST)`
    : `El SMLMV (${fmtCOP(C.smlmv)}) es inembargable; sólo 1/5 del excedente (arts. 154-155 CST)`;

  let insightText: string;
  let tone: string;
  if (esAlimentos) {
    insightText = `Por **pensión alimenticia o deudas con cooperativas**, el juez puede ordenar el embargo de hasta el **50% de todo tu salario**, incluso si ganás el mínimo: sobre **${fmtCOP(salario)}** pueden embargarte hasta **${fmtCOP(embargable)}** y te quedan libres **${fmtCOP(libre)}**. Es la única excepción que rompe la protección del SMLMV (art. 156 CST).`;
    tone = 'warning';
  } else if (embargable <= 0) {
    insightText = `Tu salario de **${fmtCOP(salario)}** es **totalmente inembargable** por deudas comunes: no supera el SMLMV 2026 (**${fmtCOP(C.smlmv)}**), que la ley protege por completo (art. 154 CST). Un banco o un particular no puede tocarte ni un peso del sueldo — sí podrían embargar cuentas u otros bienes, con límites.`;
    tone = 'good';
  } else {
    insightText = `Por una deuda común te pueden embargar como máximo **${fmtCOP(embargable)}** (el ${pct.toFixed(1).replace('.', ',')}% de tu salario): el SMLMV (${fmtCOP(C.smlmv)}) es intocable y del excedente de ${fmtCOP(excedente)} sólo es embargable la quinta parte. Te quedan libres **${fmtCOP(libre)}** al mes.`;
    tone = 'info';
  }

  const _insight = { title: 'Cuánto pueden embargarte', text: insightText, tone, icon: '⚖️' };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Te queda libre', value: Math.round(libre) },
      { label: 'Embargable', value: Math.round(embargable) },
    ].filter((s) => s.value > 0),
    prefix: '$ ',
    centerValue: fmtCOP(embargable),
    centerLabel: 'Embargo máximo',
    ariaLabel: `De un salario de ${fmtCOP(salario)}, el embargo máximo es ${fmtCOP(embargable)} y quedan libres ${fmtCOP(libre)}.`,
  };

  return {
    embargable: fmtCOP(embargable),
    libre: fmtCOP(libre),
    regla,
    porcentaje: `${pct.toFixed(1).replace('.', ',')}% del salario`,
    detalle: esAlimentos
      ? `${fmtCOP(salario)} × 50% = ${fmtCOP(embargable)} embargable; libre ${fmtCOP(libre)}.`
      : `Excedente sobre el SMLMV: ${fmtCOP(salario)} − ${fmtCOP(C.smlmv)} = ${fmtCOP(excedente)}; embargable 1/5 = ${fmtCOP(embargable)}; libre ${fmtCOP(libre)}.`,
    _insight,
    _chart,
  };
}
