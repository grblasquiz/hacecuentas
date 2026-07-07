/**
 * Recargo (sobretasa) por trabajo nocturno Perú 2026.
 * Sobretasa del 35% sobre el valor de la hora ordinaria por cada hora trabajada
 * entre las 22:00 y las 06:00 (jornada nocturna). Base legal: TUO de la Ley de
 * Jornada de Trabajo, D.S. 007-2002-TR, art. 8; el trabajador nocturno no puede
 * percibir menos de la RMV + 35% (sobretasa mínima).
 * Valor hora = sueldo mensual ÷ 30 días ÷ 8 h = sueldo ÷ 240 (patrón horas-extras-peru).
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

const SOBRETASA_NOCTURNA = 0.35;   // +35% sobre el valor hora (D.S. 007-2002-TR, art. 8)
const HORAS_MES = 240;             // 30 días × 8 h (jornada legal máxima, DS 007-2002-TR)

export interface Inputs {
  sueldoMensual: number | string;
  horasNocturnas: number | string;   // horas trabajadas entre 22:00 y 06:00 al mes
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const sueldo = num(i.sueldoMensual);
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  const horas = Math.max(0, num(i.horasNocturnas, 0));
  if (horas <= 0) throw new Error('Ingresá cuántas horas nocturnas trabajás al mes');

  const valorHora = sueldo / HORAS_MES;
  const recargoPorHora = valorHora * SOBRETASA_NOCTURNA;
  const valorHoraNocturna = valorHora * (1 + SOBRETASA_NOCTURNA);

  const recargo = horas * recargoPorHora;
  const pagoBase = horas * valorHora;
  const totalConRecargo = horas * valorHoraNocturna;

  const pct = (SOBRETASA_NOCTURNA * 100).toLocaleString('es-PE', { maximumFractionDigits: 0 });

  const _insight = {
    title: 'Tu recargo nocturno del mes',
    text: `Tu hora ordinaria vale **${fmtPEN(valorHora)}** (sueldo ÷ ${HORAS_MES}) y cada hora entre las 22:00 y las 06:00 suma una sobretasa del **${pct}%**: **${fmtPEN(recargoPorHora)}** extra por hora. Por tus **${horas} horas nocturnas** te corresponde un recargo de **${fmtPEN(recargo)}** este mes, y la hora nocturna completa queda en **${fmtPEN(valorHoraNocturna)}**. La sobretasa es un pago irrenunciable que sirve de base para CTS, gratificaciones y vacaciones.`,
    tone: 'good' as const,
    icon: '🌙',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Valor base de las ${horas} h`, value: Math.round(pagoBase) },
      { label: `Sobretasa nocturna ${pct}%`, value: Math.round(recargo) },
    ],
    prefix: 'S/ ',
    centerValue: fmtPEN(recargo),
    centerLabel: 'recargo del mes',
    ariaLabel: `Recargo nocturno mensual de ${fmtPEN(recargo)} sobre un pago base de ${fmtPEN(pagoBase)} por ${horas} horas nocturnas.`,
  };

  return {
    recargo: fmtPEN(recargo),
    valorHoraNocturna: `${fmtPEN(valorHoraNocturna)} (hora ordinaria ${fmtPEN(valorHora)} + 35%)`,
    totalConRecargo: `${fmtPEN(totalConRecargo)} (las ${horas} h nocturnas con recargo incluido)`,
    detalle: `${horas} h nocturnas × ${fmtPEN(recargoPorHora)} de sobretasa (35% de ${fmtPEN(valorHora)}) = ${fmtPEN(recargo)} de recargo al mes. RMV de referencia: ${fmtPEN(PERU_2026.rmv)}.`,
    _insight,
    _chart,
  };
}
