/**
 * Feriado trabajado — PARAGUAY (recargo 100%).
 *
 * El Código del Trabajo (Ley 213/93, arts. 231–234) establece que los días
 * feriados de descanso obligatorio se remuneran con un RECARGO DEL 100% cuando
 * se trabajan. Es decir, la hora/día feriado trabajado se paga al doble.
 *
 * - Trabajador MENSUALERO: su salario mensual ya incluye el pago del día feriado
 *   (esté o no trabajado). Si lo trabaja, cobra ADEMÁS un 100% adicional por ese
 *   día → un jornal extra por feriado trabajado.
 * - Trabajador a JORNAL: cobra el día feriado trabajado al doble (200% del jornal).
 *
 * El valor del día (jornal) se obtiene dividiendo el salario mensual por 30.
 * Moneda: guaraníes (PYG).
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026.ts';

export interface Inputs {
  salarioMensual: number;      // salario mensual (o ingreso mensual de referencia), en Gs.
  diasFeriado?: number;        // cantidad de días feriados trabajados
  tipoPago?: string;           // 'mensual' | 'jornalero'
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual) || 0;
  if (salario <= 0) throw new Error('Ingresá tu salario mensual');
  const dias = Math.max(1, Math.floor(Number(i.diasFeriado) || 1));
  const esJornalero = String(i.tipoPago || 'mensual') === 'jornalero';

  const recargo = PARAGUAY_2026.laboral.horaFeriadoDomingo; // 1.00 = +100%
  const valorDia = salario / PARAGUAY_2026.diasMes;          // jornal = mensual / 30
  const recargoPorDia = valorDia * recargo;                  // el 100% adicional
  const pagoDiaDoble = valorDia * (1 + recargo);             // día al 200%

  // Mensualero: el día ya está en el sueldo → cobra sólo el adicional (100%).
  // Jornalero: cobra el día completo al doble (200%).
  const totalACobrar = esJornalero ? pagoDiaDoble * dias : recargoPorDia * dias;

  const _table = {
    title: 'Cómo se paga el feriado trabajado (recargo 100%)',
    headers: ['Concepto', 'Cálculo', 'Monto'],
    rows: [
      ['Valor del día (jornal)', `${fmtPYG(salario)} ÷ 30`, fmtPYG(Math.round(valorDia))],
      ['Recargo por feriado (100%)', `jornal × 100%`, fmtPYG(Math.round(recargoPorDia))],
      ['Día feriado al doble (200%)', `jornal × 2`, fmtPYG(Math.round(pagoDiaDoble))],
      [`${dias} día(s) — total a cobrar`, esJornalero ? 'día doble × días' : 'adicional × días', fmtPYG(Math.round(totalACobrar))],
    ],
    note: 'Ley 213/93 (Código del Trabajo). El mensualero ya tiene el día en su sueldo, por eso el feriado trabajado le suma el 100% adicional; el jornalero cobra el día al 200%.',
  };

  const _insight = {
    type: 'highlight',
    icon: '📅',
    text: esJornalero
      ? `Como trabajador a jornal, cada día feriado trabajado se paga al **doble**: **${fmtPYG(Math.round(pagoDiaDoble))}** por día. Por **${dias} día(s)** cobrás **${fmtPYG(Math.round(totalACobrar))}**.`
      : `Tu día vale **${fmtPYG(Math.round(valorDia))}**. Como el sueldo mensual ya incluye el feriado, trabajarlo te suma un **100% adicional** (${fmtPYG(Math.round(recargoPorDia))}) por día. Por **${dias} día(s)** cobrás **${fmtPYG(Math.round(totalACobrar))}** extra sobre tu sueldo.`,
  };

  return {
    valorDia: fmtPYG(Math.round(valorDia)),
    recargoPorDia: fmtPYG(Math.round(recargoPorDia)),
    pagoDiaDoble: fmtPYG(Math.round(pagoDiaDoble)),
    totalACobrar: fmtPYG(Math.round(totalACobrar)),
    detalle: esJornalero
      ? `Jornal ${fmtPYG(Math.round(valorDia))} × 2 (200%) × ${dias} día(s) = ${fmtPYG(Math.round(totalACobrar))}.`
      : `Adicional 100% = jornal ${fmtPYG(Math.round(valorDia))} × ${dias} día(s) = ${fmtPYG(Math.round(totalACobrar))} extra sobre el sueldo.`,
    _insight,
    _table,
  };
}
