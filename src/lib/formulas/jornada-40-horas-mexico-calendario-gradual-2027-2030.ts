/**
 * Jornada de 40 horas México — calendario GRADUAL 2027-2030.
 * IMPORTANTE: en 2026 la jornada máxima legal SIGUE SIENDO 48 horas (año de
 * transición). La reforma constitucional (DOF 03-mar-2026) y la LFT (DOF
 * 01-may-2026) bajan 2 horas por año desde el 1 de enero: 46 h en 2027,
 * 44 h en 2028, 42 h en 2029 y 40 h en 2030 — sin reducción de salario.
 * Calendario desde src/lib/data/mexico-2026.ts (JORNADA_40H_CALENDARIO).
 */
import { JORNADA_40H_CALENDARIO, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  anio: number | string;          // 2026..2030
  horasSemanaActual?: number;     // cuántas horas trabajas hoy por semana
  sueldoMensual?: number;         // opcional: para valor de la hora
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Horas mensuales promedio a partir de horas semanales (52 semanas / 12 meses). */
function horasMes(horasSemana: number): number {
  return (horasSemana * 52) / 12;
}

export function compute(i: Inputs): Outputs {
  const anio = Math.floor(num(i.anio, 2026));
  if (!(anio in JORNADA_40H_CALENDARIO)) throw new Error('Elige un año entre 2026 y 2030');
  const horasHoy = Math.min(48, Math.max(1, num(i.horasSemanaActual, 48)));
  const sueldo = Math.max(0, num(i.sueldoMensual, 0));

  const maximaAnio = JORNADA_40H_CALENDARIO[anio];
  const reduccionVs48 = 48 - maximaAnio;
  const teAfecta = horasHoy > maximaAnio;
  const horasQueBajas = Math.max(0, horasHoy - maximaAnio);

  // Valor de la hora: mismo sueldo, menos horas → cada hora vale más.
  const valorHoraHoy = sueldo > 0 ? round2(sueldo / horasMes(horasHoy)) : 0;
  const valorHoraAnio = sueldo > 0 ? round2(sueldo / horasMes(Math.min(horasHoy, maximaAnio))) : 0;
  const valorHora2030 = sueldo > 0 ? round2(sueldo / horasMes(Math.min(horasHoy, 40))) : 0;

  const calendarioTxt = '2026: 48 h (transición) → 2027: 46 h → 2028: 44 h → 2029: 42 h → 2030: 40 h (desde el 1 de enero de cada año)';

  const detalle = anio === 2026
    ? `En 2026 la jornada máxima legal SIGUE en 48 horas semanales: la reducción arranca el 1 de enero de 2027 (46 h). ${calendarioTxt}.`
    : `Jornada máxima legal en ${anio}: ${maximaAnio} horas semanales (${reduccionVs48} h menos que las 48 de 2026). ${calendarioTxt}.`;

  let insightText: string;
  if (anio === 2026) {
    insightText = `**Ojo: en 2026 no cambia nada todavía.** La jornada máxima sigue siendo **48 horas semanales**; 2026 es el año de transición para que las empresas se adapten. La primera reducción real llega el **1 de enero de 2027 (46 h)** y baja 2 horas por año hasta las **40 h en 2030** — por ley, **sin reducir salario ni prestaciones**.${sueldo > 0 ? ` Con tu sueldo de ${fmtMXN(sueldo)}, tu hora pasa de valer **${fmtMXN(valorHoraHoy)}** hoy a **${fmtMXN(valorHora2030)}** en 2030 (mismo pago, menos horas).` : ''}`;
  } else if (teAfecta) {
    insightText = `En **${anio}** la jornada máxima legal baja a **${maximaAnio} horas semanales**. Como hoy trabajas ${horasHoy} h, tu semana se acorta **${horasQueBajas} h** — y tu salario **no puede bajar** por esta reducción (lo prohíbe expresamente la reforma).${sueldo > 0 ? ` Con ${fmtMXN(sueldo)} al mes, el valor de tu hora sube de **${fmtMXN(valorHoraHoy)}** a **${fmtMXN(valorHoraAnio)}** en ${anio} y a **${fmtMXN(valorHora2030)}** en 2030.` : ''} Lo que exceda la nueva jornada máxima se paga como **tiempo extra**.`;
  } else {
    insightText = `En **${anio}** la jornada máxima legal será de **${maximaAnio} horas semanales**, pero como hoy trabajas **${horasHoy} h**, ya estás por debajo del tope: la reforma no acorta tu semana ese año${horasHoy > 40 ? ` (te alcanzará cuando el tope baje de ${horasHoy} h)` : ' (ya cumples incluso la meta de 40 h de 2030)'}. Recuerda: la reducción nunca puede traducirse en menor salario.`;
  }

  const _insight = {
    title: anio === 2026 ? 'En 2026 siguen las 48 horas' : `Jornada máxima ${anio}: ${maximaAnio} horas`,
    text: insightText,
    tone: anio === 2026 ? 'warn' : 'good',
    icon: '⏰',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['2026', '2027', '2028', '2029', '2030'],
    values: [48, 46, 44, 42, 40],
    suffix: ' h',
    ariaLabel: 'Jornada máxima semanal por año: 48 horas en 2026, 46 en 2027, 44 en 2028, 42 en 2029 y 40 en 2030.',
  };

  return {
    jornadaMaximaAnio: `${maximaAnio} horas semanales en ${anio}${anio === 2026 ? ' (todavía SIN cambio: la reducción empieza en 2027)' : ''}`,
    horasQueTeBajan: teAfecta ? `${horasQueBajas} h menos que tu semana actual de ${horasHoy} h` : `0 h — tu semana de ${horasHoy} h ya cumple el tope de ${anio}`,
    valorHora: sueldo > 0 ? `${fmtMXN(valorHoraHoy)} hoy → ${fmtMXN(valorHoraAnio)} en ${anio} → ${fmtMXN(valorHora2030)} en 2030` : 'Ingresa tu sueldo mensual para verlo',
    calendario: calendarioTxt,
    detalle,
    _insight,
    _chart,
  };
}
