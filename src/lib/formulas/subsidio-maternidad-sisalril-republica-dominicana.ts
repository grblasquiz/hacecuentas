/**
 * Subsidio por maternidad (SFS) — República Dominicana. SISALRIL paga en efectivo
 * a la trabajadora afiliada al Régimen Contributivo un subsidio equivalente a
 * 14 semanas de salario durante el descanso pre y post natal.
 *
 * Cálculo (Ley 87-01 Art. 132 y Reglamento de Subsidios): base reguladora =
 * salario mensual cotizable (promedio de las cotizaciones de la trabajadora),
 * multiplicada por 3 → monto total del subsidio. La base se topea en 10 salarios
 * mínimos cotizables; si el salario supera ese tope, el empleador cubre la
 * diferencia para que reciba su salario ordinario completo.
 *   subsidioTotal = min(salarioPromedio, tope) × 3
 * Requisito general: al menos 8 (algunas fuentes: 12) cotizaciones en los 12
 * meses previos. La calc no exige el mínimo; lo aclara en el contenido.
 */
import { REPUBLICA_DOMINICANA_2026, fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioPromedio: number; // salario mensual cotizable promedio (RD$)
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const salario = num(i.salarioPromedio, 0);
  if (!(salario > 0)) throw new Error('Ingresá tu salario mensual cotizable promedio en RD$');

  const tope = REPUBLICA_DOMINICANA_2026.tss.topeSfs; // 10 salarios mínimos cotizables
  const baseReguladora = Math.min(salario, tope);
  const subsidioTotal = baseReguladora * 3;
  const porSemana = subsidioTotal / 14; // 14 semanas de descanso
  const diferenciaEmpleador = Math.max(0, (salario - baseReguladora) * 3);

  const detalle =
    `Base reguladora ${fmtDOP(baseReguladora)}` +
    (salario > tope ? ` (topeada en 10 salarios mínimos cotizables; tu salario ${fmtDOP(salario)} lo supera)` : '') +
    ` × 3 = ${fmtDOP(subsidioTotal)} de subsidio por las 14 semanas` +
    (diferenciaEmpleador > 0 ? `. El empleador completa ${fmtDOP(diferenciaEmpleador)} para tu salario íntegro.` : '.');

  const _insight = {
    title: `Subsidio de maternidad: ${fmtDOP(subsidioTotal)}`,
    text:
      `Con un salario cotizable de **${fmtDOP(salario)}**, SISALRIL te paga **${fmtDOP(subsidioTotal)}** ` +
      `(base reguladora **${fmtDOP(baseReguladora)}** × 3) por las **14 semanas** de descanso pre y post natal, ` +
      `es decir ~**${fmtDOP(porSemana)}** por semana. ` +
      (salario > tope
        ? `Como tu salario supera el tope de 10 salarios mínimos cotizables (${fmtDOP(tope)}), el **empleador** debe completar **${fmtDOP(diferenciaEmpleador)}** para que cobres tu salario ordinario completo.`
        : `Este monto lo paga el Seguro Familiar de Salud, no tu empleador.`),
    tone: 'neutral' as const,
    icon: '🤱',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Base reguladora', 'Subsidio total (×3)'],
    values: [Math.round(baseReguladora), Math.round(subsidioTotal)],
    prefix: 'RD$ ',
    ariaLabel: `Base reguladora ${fmtDOP(baseReguladora)} y subsidio total ${fmtDOP(subsidioTotal)}.`,
  };

  return {
    subsidioTotal: fmtDOP(subsidioTotal),
    baseReguladora: fmtDOP(baseReguladora),
    porSemana: fmtDOP(porSemana),
    diferenciaEmpleador: fmtDOP(diferenciaEmpleador),
    detalle,
    _insight,
    _chart,
  };
}
