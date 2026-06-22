/**
 * Calculadora de horas extra — Uruguay 2026.
 *
 * Régimen (Ley 15.996 / Decreto 550/989, MTSS):
 *  - Día hábil: la hora extra se paga con un recargo del 100% → vale el doble
 *    de la hora simple (factor ×2,0).
 *  - Feriado no laborable o día de descanso: recargo del 150% → factor ×2,5.
 *  - Tope: 8 horas extra por semana.
 *
 * El valor de la hora simple se deriva del sueldo nominal y la jornada mensual.
 * Por defecto se usa la jornada de Comercio (44 h/semana ≈ 191,4 h/mes); el
 * usuario puede declarar otra jornada semanal.
 *
 * Data: src/lib/data/uruguay-2026.ts (URUGUAY_2026.laboral.horaExtra).
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface HorasExtraInputs {
  /** Sueldo mensual nominal, en pesos. */
  sueldo?: number | string;
  /** Cantidad de horas extra realizadas. */
  cantidadHoras?: number | string;
  /** "habil" (día hábil, ×2,0) | "feriado" (feriado/descanso, ×2,5). */
  tipo?: string;
  /** Jornada semanal en horas (default 44, Comercio). */
  jornadaSemanal?: number | string;
}

export interface HorasExtraOutputs {
  totalHorasExtra: string;
  totalHorasExtraMonto: number;
  valorHoraSimple: string;
  valorHoraExtra: string;
  recargo: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraHorasExtraUruguay(i: HorasExtraInputs): HorasExtraOutputs {
  const sueldo = Math.max(0, Number(i.sueldo) || 0);
  const horas = Math.max(0, Number(i.cantidadHoras) || 0);
  const tipo = i.tipo === 'feriado' ? 'feriado' : 'habil';
  const jornadaSemanal = Math.max(1, Number(i.jornadaSemanal) || URUGUAY_2026.laboral.jornadaSemanalHoras);

  // Horas mensuales = jornada semanal × (52 semanas / 12 meses) ≈ ×4,333.
  const horasMes = jornadaSemanal * (52 / 12);
  const valorHora = horasMes > 0 ? sueldo / horasMes : 0;

  const he = URUGUAY_2026.laboral.horaExtra;
  // factor = 1 + recargo. Hábil: 1 + 1,00 = 2,0; feriado/descanso: 1 + 1,50 = 2,5.
  const recargoPct = tipo === 'feriado' ? he.feriadoODescanso : he.diaHabil;
  const factor = 1 + recargoPct;
  const valorHoraExtra = valorHora * factor;
  const total = valorHoraExtra * horas;

  return {
    totalHorasExtra: fmtUYU(total),
    totalHorasExtraMonto: Math.round(total),
    valorHoraSimple: fmtUYU(valorHora),
    valorHoraExtra: fmtUYU(valorHoraExtra),
    recargo: `+${Math.round(recargoPct * 100)}% (×${factor.toFixed(1)})`,
    detalle:
      `Hora simple ${fmtUYU(valorHora)} (sueldo ÷ ${horasMes.toFixed(1)} h/mes) × ${factor.toFixed(1)} = ` +
      `${fmtUYU(valorHoraExtra)}/hora extra × ${horas} = ${fmtUYU(total)}.`,
    _insight: {
      title: tipo === 'feriado' ? 'Horas extra en feriado/descanso' : 'Horas extra en día hábil',
      text:
        `Tu hora simple vale **${fmtUYU(valorHora)}**. En **${tipo === 'feriado' ? 'feriado o día de descanso' : 'día hábil'}** la hora extra paga **+${Math.round(recargoPct * 100)}%** → **${fmtUYU(valorHoraExtra)}** cada una. ` +
        `Por **${horas} hora/s** cobrás **${fmtUYU(total)}**.` +
        (horas > he.topeSemanal ? ` Ojo: el tope legal es **${he.topeSemanal} horas extra por semana**.` : ''),
      tone: 'info' as const,
      icon: '⏱️',
    },
    _table: {
      title: 'Valor de la hora extra (sueldo nominal ' + fmtUYU(sueldo) + ', jornada ' + jornadaSemanal + ' h/sem)',
      headers: ['Tipo', 'Recargo', 'Valor por hora', 'Ejemplo (' + horas + ' h)'],
      rows: [
        ['Día hábil', '+100%', fmtUYU(valorHora * 2), fmtUYU(valorHora * 2 * horas)],
        ['Feriado / descanso', '+150%', fmtUYU(valorHora * 2.5), fmtUYU(valorHora * 2.5 * horas)],
      ],
      note: 'La hora extra en día hábil se paga al doble (×2,0) y en feriado no laborable o día de descanso al ×2,5. Tope: 8 horas extra por semana (Ley 15.996 / Decreto 550/989).',
    },
  };
}
