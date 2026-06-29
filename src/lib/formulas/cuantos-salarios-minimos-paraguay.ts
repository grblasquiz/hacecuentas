/**
 * ¿Cuántos salarios mínimos gano? — PARAGUAY 2026.
 *
 * Compara un sueldo mensual con el salario mínimo vigente (SMV), el jornal
 * mínimo y la canasta básica de alimentos del INE.
 *
 *   cantSalariosMinimos = sueldoMensual / SMV
 *   cantJornales        = round(sueldoMensual / jornal)
 *   vsCanastaBasica     = sueldoMensual / canasta · 100   (en %)
 *   sobreOdebajoSMV     = sueldoMensual ≥ SMV ? "por encima" : "por debajo"
 *
 * Defaults: SMV Gs. 3.044.000 (Decreto 6225, desde 1-jul-2026), jornal mínimo
 * Gs. 117.077, canasta básica de alimentos Gs. 933.108 (INE 2025).
 * Moneda: guaraníes (PYG).
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

const CANASTA_BASICA_ALIMENTOS = 933108; // INE 2025 — canasta básica de alimentos por persona (Gs.)

export interface CuantosSalariosMinimosParaguayInputs {
  sueldoMensual?: number | string;
  SMV?: number | string;
}

export interface CuantosSalariosMinimosParaguayOutputs {
  cantSalariosMinimos: number;
  cantJornales: number;
  vsCanastaBasica: number;
  sobreOdebajoSMV: string;
  resumen: string;
  formula: string;
  _insight?: any;
  _table?: any;
}

export function cuantosSalariosMinimosParaguay(
  input: CuantosSalariosMinimosParaguayInputs,
): CuantosSalariosMinimosParaguayOutputs {
  const sueldoMensual = Math.max(0, Number(input.sueldoMensual) || 0);
  let SMV = Number(input.SMV);
  if (!Number.isFinite(SMV) || SMV <= 0) SMV = PARAGUAY_2026.salarioMinimo; // 3.044.000
  const JORNAL = PARAGUAY_2026.jornalMinimo; // 117.077

  if (sueldoMensual <= 0) throw new Error('Ingresá tu sueldo mensual');

  const cantSalariosMinimos = sueldoMensual / SMV;
  const cantJornales = Math.round(sueldoMensual / JORNAL);
  const vsCanastaBasica = (sueldoMensual / CANASTA_BASICA_ALIMENTOS) * 100;
  const sobreOdebajoSMV = sueldoMensual >= SMV ? 'por encima' : 'por debajo';

  const cantStr = cantSalariosMinimos.toFixed(2);

  const resumen =
    `${fmtPYG(sueldoMensual)} equivalen a ${cantStr} salarios mínimos ` +
    `(${cantJornales} jornales) y a ${vsCanastaBasica.toFixed(1)}% de la canasta básica de alimentos.`;

  const formula =
    `Salarios mínimos = sueldo ÷ SMV = ${fmtPYG(sueldoMensual)} ÷ ${fmtPYG(SMV)} = ${cantStr}`;

  const _insight = {
    type: 'highlight' as const,
    icon: '📊',
    text:
      `Tu sueldo está **${sobreOdebajoSMV}** del salario mínimo: equivale a **${cantStr} salarios mínimos** ` +
      `(o ${cantJornales} jornales). Frente a la canasta básica de alimentos del INE (${fmtPYG(CANASTA_BASICA_ALIMENTOS)} por persona), ` +
      `tu ingreso representa **${vsCanastaBasica.toFixed(1)}%**` +
      (vsCanastaBasica >= 100
        ? `, es decir que cubre más de una canasta básica de alimentos.`
        : `, es decir que no llega a cubrir una canasta básica de alimentos.`),
  };

  const _table = {
    title: 'Tu sueldo comparado',
    headers: ['Referencia', 'Valor', 'Equivalencia de tu sueldo'],
    rows: [
      ['Salario mínimo (SMV)', fmtPYG(SMV), `${cantStr} SMV`],
      ['Jornal mínimo', fmtPYG(JORNAL), `${cantJornales} jornales`],
      ['Canasta básica de alimentos (INE)', fmtPYG(CANASTA_BASICA_ALIMENTOS), `${vsCanastaBasica.toFixed(1)}%`],
    ],
    note: 'SMV Gs. 3.044.000 (Decreto 6225, vigente desde el 1-jul-2026). Jornal mínimo Gs. 117.077. Canasta básica de alimentos por persona según el INE (2025). La canasta familiar total depende de la cantidad de integrantes del hogar.',
  };

  return {
    cantSalariosMinimos: Number(cantSalariosMinimos.toFixed(2)),
    cantJornales,
    vsCanastaBasica: Number(vsCanastaBasica.toFixed(1)),
    sobreOdebajoSMV,
    resumen,
    formula,
    _insight,
    _table,
  };
}
