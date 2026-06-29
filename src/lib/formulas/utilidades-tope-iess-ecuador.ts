/**
 * Utilidades: tope individual y excedente al IESS (Ecuador).
 * Tope = 24 × SBU = 24 × $482 = $11.568 (2026). El excedente se entrega al IESS.
 * Fuente: Código del Trabajo, Ministerio del Trabajo (trabajo.gob.ec). Verificado 2026-06-29.
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  utilidadCalculada: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; _table?: any; }

const SBU = ECUADOR_2026.sbu; // 482
const TOPE = 24 * SBU;        // 11.568

export function compute(i: Inputs): Outputs {
  const utilidad = Number(i.utilidadCalculada) || 0;
  if (utilidad <= 0) throw new Error('Ingresá la utilidad calculada para el trabajador');

  const recibeTrabajador = Math.min(utilidad, TOPE);
  const excedenteIess = Math.max(utilidad - TOPE, 0);
  const superaTope = excedenteIess > 0;

  const _insight = {
    title: superaTope ? 'Tus utilidades superan el tope' : 'Recibís el total de tus utilidades',
    text: superaTope
      ? `Tu utilidad calculada de **${fmtUSDec(utilidad)}** supera el tope de 24 SBU (**${fmtUSDec(TOPE)}**). Recibís **${fmtUSDec(recibeTrabajador)}** y **${fmtUSDec(excedenteIess)}** se transfieren al IESS, no a tu empleador.`
      : `Tu utilidad de **${fmtUSDec(utilidad)}** está por debajo del tope de 24 SBU (**${fmtUSDec(TOPE)}**), así que la recibís completa: **${fmtUSDec(recibeTrabajador)}**. No hay excedente al IESS.`,
    tone: superaTope ? 'warn' : 'good',
    icon: '💵',
  };

  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Recibe el trabajador', value: Math.round(recibeTrabajador * 100) / 100 },
      { label: 'Excedente al IESS', value: Math.round(excedenteIess * 100) / 100 },
    ],
    ariaLabel: `Recibe ${fmtUSDec(recibeTrabajador)}, excedente al IESS ${fmtUSDec(excedenteIess)}.`,
  };

  // Tabla: mismo cálculo (mín/máx contra el tope) para varios montos de utilidad.
  const anclas = [3000, 8000, TOPE, 13000, 15000, 20000, 30000];
  if (utilidad > 0 && !anclas.includes(utilidad)) anclas.push(utilidad);
  const filas = Array.from(new Set(anclas)).sort((a, b) => a - b).slice(0, 7);
  const tableRows = filas.map((u) => {
    const recibe = Math.min(u, TOPE);
    const exc = Math.max(u - TOPE, 0);
    const esTope = u === TOPE;
    return [
      `${fmtUSDec(u)}${esTope ? ' (tope)' : ''}${u === utilidad ? ' (tu caso)' : ''}`,
      fmtUSDec(recibe),
      fmtUSDec(exc),
    ];
  });
  const _table = {
    title: `Tope de utilidades y excedente al IESS (24 SBU = ${fmtUSDec(TOPE)})`,
    headers: ['Utilidad calculada', 'Recibe el trabajador', 'Excedente al IESS'],
    align: ['left', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: tableRows,
    note: 'Tope = 24 × SBU = 24 × $482 = $11.568 (2026). Lo que excede el tope se entrega al IESS para el régimen de prestaciones solidarias, no a la empresa.',
  };

  return {
    recibeTrabajador: fmtUSDec(recibeTrabajador),
    tope: fmtUSDec(TOPE),
    excedenteIess: fmtUSDec(excedenteIess),
    detalle: `Tope 24 SBU = ${fmtUSDec(TOPE)}. Recibís ${fmtUSDec(recibeTrabajador)}${superaTope ? `, excedente al IESS ${fmtUSDec(excedenteIess)}` : ' (sin excedente)'}.`,
    _insight,
    _chart,
    _table,
  };
}
