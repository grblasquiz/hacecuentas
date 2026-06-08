/**
 * Días hábiles del mes actual (descontando fines de semana y feriados) — AR 2026.
 * Datos: src/lib/data/feriados-ar-2026.ts (fuente única).
 *
 * Cuenta los días hábiles de un mes: total de días − sábados/domingos − feriados
 * que caen entre semana. La fecha ingresada sólo selecciona el mes; si viene
 * vacía se usa el mes en curso. Los feriados sólo se descuentan para 2026 (año
 * del calendario disponible en la fuente).
 */

import { MESES, feriadoEnFecha, formatFecha } from '../data/feriados-ar-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object; }

const ANIO_DATOS = 2026;

export function diasHabilesMesActualFeriados(i: Inputs): Outputs {
  // El mes lo define la fecha ingresada; si está vacía, el mes actual.
  const raw = String(i.fecha1 || '').trim();
  let ref: Date;
  if (raw) {
    const parts = raw.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return { resultado: '—', resumen: 'Fecha inválida. Usá el formato AAAA-MM-DD (ej.: 2026-06-08).' };
    }
    ref = new Date(parts[0], parts[1] - 1, parts[2]);
    if (isNaN(ref.getTime())) {
      return { resultado: '—', resumen: 'Fecha inválida. Usá el formato AAAA-MM-DD (ej.: 2026-06-08).' };
    }
  } else {
    ref = new Date();
  }

  const year = ref.getFullYear();
  const month = ref.getMonth(); // 0-11
  const diasEnMes = new Date(year, month + 1, 0).getDate();

  let habiles = 0;
  let finde = 0;
  let feriadosEntreSemana = 0;
  const feriadosDelMes: string[] = [];

  for (let d = 1; d <= diasEnMes; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    const esFinde = dow === 0 || dow === 6;
    const fer = year === ANIO_DATOS ? feriadoEnFecha(date) : null;

    if (fer) {
      // Registrar el feriado (caiga o no en finde) para la lista del mes.
      feriadosDelMes.push(`• ${formatFecha(fer.fecha)} — ${fer.nombre}`);
    }
    if (esFinde) {
      finde++;
    } else if (fer) {
      feriadosEntreSemana++;
    } else {
      habiles++;
    }
  }

  const mesNombre = MESES[month + 1];
  const notaAnio = year === ANIO_DATOS
    ? ''
    : ` (nota: el descuento de feriados sólo está disponible para ${ANIO_DATOS}; para ${year} sólo se descuentan fines de semana).`;

  const resumen =
    `${mesNombre} de ${year} tiene ${diasEnMes} días: ${habiles} hábiles, ${finde} de fin de semana` +
    ` y ${feriadosEntreSemana} feriado(s) entre semana.${notaAnio}`;

  const lista = feriadosDelMes.length
    ? feriadosDelMes.join('\n')
    : `Sin feriados nacionales en ${mesNombre} de ${year}.`;

  const _insight = {
    title: `${habiles} días hábiles en ${mesNombre}`,
    text: feriadosEntreSemana > 0
      ? `En ${mesNombre} de ${year} trabajás **${habiles} días**: del total de ${diasEnMes}, ${finde} son fin de semana y **${feriadosEntreSemana} feriado(s)** entre semana te dan descanso extra.`
      : `En ${mesNombre} de ${year} hay **${habiles} días hábiles** (${diasEnMes} días menos ${finde} de fin de semana). No hay feriados nacionales entre semana este mes.`,
    tone: feriadosEntreSemana > 0 ? 'good' : 'neutral',
    icon: '📆',
  };

  return {
    resultado: `${habiles} días hábiles`,
    resumen,
    lista,
    _insight,
  };
}
