/**
 * Pago de días feriados y domingos (día de descanso) trabajados — LOTTT.
 * Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras, Art. 119-120.
 *
 *   - El día feriado o de descanso trabajado se paga con un RECARGO del 50%
 *     sobre el salario normal, ADEMÁS del salario del día.
 *     → Por cada día feriado/descanso trabajado se perciben 1,5 salarios diarios
 *       (1 del día + 0,5 de recargo) por encima de la remuneración mensual.
 *   - Si el día trabajado era de descanso, nace además el derecho a un día de
 *     descanso compensatorio remunerado (no sustituible por dinero).
 *
 * Fuente: LOTTT Art. 119-120 (ley.com.ve); Acceso a la Justicia.
 */
import { FERIADO_LOTTT, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioMensual?: number;         // salario normal mensual en Bs.
  diasTrabajados?: number;         // cantidad de feriados/domingos trabajados
  generaCompensatorio?: string;    // "si" | "no" — ¿era día de descanso?
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const salarioMensual = Math.max(0, Number(i.salarioMensual) || 0);
  if (!salarioMensual) throw new Error('Ingresá tu salario normal mensual (Bs.)');

  const diasTrabajados = Math.max(1, Math.floor(Number(i.diasTrabajados) || 0));
  if (!diasTrabajados) throw new Error('Ingresá cuántos días feriados o domingos trabajaste');

  const generaCompensatorio = String(i.generaCompensatorio ?? 'si') === 'si';

  const salarioDiario = salarioMensual / 30;
  const recargoPorDia = salarioDiario * FERIADO_LOTTT.recargo; // 50%
  const pagoPorDia = salarioDiario + recargoPorDia;            // 1,5 × salario diario

  const recargoTotal = recargoPorDia * diasTrabajados;
  const pagoTotalDias = pagoPorDia * diasTrabajados;
  const diasCompensatorios = generaCompensatorio ? diasTrabajados : 0;

  const _insight = {
    type: 'highlight',
    icon: '📅',
    text: `Con un salario de **${fmtVES(salarioMensual)}** (${fmtVES(salarioDiario)}/día), cada feriado o domingo trabajado se paga **${fmtVES(pagoPorDia)}** ` +
      `(el día + 50% de recargo = **${fmtVES(recargoPorDia)}**). Por **${diasTrabajados} día(s)** te corresponden **${fmtVES(pagoTotalDias)}** ` +
      (generaCompensatorio
        ? `más **${diasCompensatorios} día(s)** de descanso compensatorio remunerado.`
        : `(sin descanso compensatorio porque no era tu día de descanso).`),
  };

  const _table = {
    title: 'Pago por feriados / domingos trabajados (LOTTT Art. 120)',
    headers: ['Concepto', 'Cálculo', 'Monto'],
    rows: [
      ['Salario diario normal', `${fmtVES(salarioMensual)} ÷ 30`, fmtVES(salarioDiario)],
      ['Recargo 50% por día', `${fmtVES(salarioDiario)} × 50%`, fmtVES(recargoPorDia)],
      ['Pago por día trabajado', 'Día + recargo (×1,5)', fmtVES(pagoPorDia)],
      [`Total por ${diasTrabajados} día(s)`, `${fmtVES(pagoPorDia)} × ${diasTrabajados}`, fmtVES(pagoTotalDias)],
      ['Descanso compensatorio', generaCompensatorio ? `${diasCompensatorios} día(s)` : 'No aplica', '—'],
    ],
    note: 'El feriado/descanso trabajado se paga con recargo del 50% sobre el salario normal (Art. 120 LOTTT). Si era tu día de descanso, además ganás un día de descanso compensatorio remunerado que no puede canjearse por dinero.',
  };

  return {
    pagoTotalDias: Number(pagoTotalDias.toFixed(2)),
    recargoTotal: Number(recargoTotal.toFixed(2)),
    pagoPorDia: Number(pagoPorDia.toFixed(2)),
    diasCompensatorios,
    detalle: `${diasTrabajados} × ${fmtVES(pagoPorDia)} = ${fmtVES(pagoTotalDias)}${generaCompensatorio ? ` + ${diasCompensatorios} día(s) compensatorio(s)` : ''}`,
    _insight,
    _table,
  };
}
