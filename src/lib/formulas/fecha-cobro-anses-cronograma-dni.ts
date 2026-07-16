/**
 * Cronograma de cobro ANSES por terminación de DNI.
 *
 * ANSES ordena los pagos por el ÚLTIMO dígito del DNI: la terminación 0 cobra
 * primero y la 9 última, un dígito por día hábil. La FECHA de inicio de cada
 * grupo (jubilados con haber mínimo, jubilados con haber superior, AUH, SUAF,
 * desempleo, PNC) la publica ANSES cada mes; por eso el calc pide esa fecha de
 * arranque y calcula el día exacto que te toca, salteando fines de semana y
 * feriados nacionales (fuente única: feriados-ar-2026.ts).
 *
 * El algoritmo del ORDEN por dígito es determinístico; la fecha depende del
 * calendario mensual oficial, que siempre hay que confirmar en ANSES.
 */

import { FERIADOS_AR_2026, parseLocal, DIAS_SEMANA, MESES } from '../data/feriados-ar-2026.ts';

export interface Inputs {
  dni: number | string;
  fechaInicio: string; // 'YYYY-MM-DD' — primer día de pago del grupo (lo publica ANSES)
  tipoBeneficio?: string;
}

export interface Outputs {
  terminacion: number;
  orden: number; // 1..10
  fechaCobro: string; // 'YYYY-MM-DD'
  fechaCobroLegible: string;
  diaSemana: string;
  tipoBeneficio: string;
  detalle: string;
  _insight?: any;
}

const FERIADOS_SET = new Set(FERIADOS_AR_2026.map(f => f.fecha));

const TIPOS: Record<string, string> = {
  'jubilado-minima': 'Jubilados y pensionados con haber mínimo',
  'jubilado-superior': 'Jubilados y pensionados con haber superior al mínimo',
  auh: 'Asignación Universal por Hijo (AUH)',
  suaf: 'Asignaciones Familiares (SUAF)',
  desempleo: 'Prestación por Desempleo',
  pnc: 'Pensiones No Contributivas (PNC)',
};

/** ¿Es día hábil de pago? (no sábado, no domingo, no feriado nacional). */
function esHabil(d: Date): boolean {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return false;
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return !FERIADOS_SET.has(iso);
}

/** Suma `n` días hábiles a `inicio` (n=0 → el propio inicio si es hábil, o el próximo hábil). */
function sumarHabiles(inicio: Date, n: number): Date {
  const d = new Date(inicio.getTime());
  // asegurar que el arranque sea hábil
  while (!esHabil(d)) d.setDate(d.getDate() + 1);
  let contados = 0;
  while (contados < n) {
    d.setDate(d.getDate() + 1);
    if (esHabil(d)) contados++;
  }
  return d;
}

export function compute(i: Inputs): Outputs {
  const dniLimpio = String(i.dni ?? '').replace(/\D/g, '');
  if (!dniLimpio) throw new Error('Ingresá tu número de DNI.');
  const terminacion = Number(dniLimpio[dniLimpio.length - 1]);

  const inicio = parseLocal(String(i.fechaInicio || ''));
  if (isNaN(inicio.getTime())) throw new Error('Ingresá la fecha de inicio de pagos del mes (la publica ANSES).');

  const tipo = String(i.tipoBeneficio || 'jubilado-minima');
  const tipoLabel = TIPOS[tipo] || TIPOS['jubilado-minima'];

  // La terminación 0 cobra el primer día hábil; cada dígito, un día hábil después.
  const orden = terminacion + 1; // 1..10
  const fecha = sumarHabiles(inicio, terminacion);

  const iso = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  const dow = DIAS_SEMANA[fecha.getDay()];
  const legible = `${dow} ${fecha.getDate()} de ${MESES[fecha.getMonth() + 1].toLowerCase()} de ${fecha.getFullYear()}`;

  const _insight = {
    title: `Cobrás el ${fecha.getDate()}/${fecha.getMonth() + 1}`,
    text: `Tu DNI termina en **${terminacion}**, así que en el grupo **${tipoLabel}** sos el **${orden}° en orden de cobro**. Arrancando los pagos el ${inicio.getDate()}/${inicio.getMonth() + 1}, te toca el **${legible}** (ya salteando fines de semana y feriados). **Importante:** la fecha de inicio la fija ANSES cada mes; confirmá el cronograma oficial antes de ir al cajero.`,
    tone: 'neutral',
    icon: '🗓️',
  };

  return {
    terminacion,
    orden,
    fechaCobro: iso,
    fechaCobroLegible: legible,
    diaSemana: dow,
    tipoBeneficio: tipoLabel,
    detalle: `DNI terminado en ${terminacion} → ${orden}° en el orden. Grupo: ${tipoLabel}. Inicio ${i.fechaInicio} → cobro ${legible}.`,
    _insight,
  };
}
