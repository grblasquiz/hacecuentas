/**
 * Calculadora de antigüedad laboral en Venezuela (LOTTT).
 *
 * Descompone el tiempo de servicio entre dos fechas en años, meses y días, y
 * determina los días de vacaciones anuales que corresponden por antigüedad
 * según el Art. 190 de la LOTTT: 15 días hábiles el primer año + 1 día por
 * cada año adicional de servicio, con un tope de 30 días. La tabla de
 * vacaciones se lee de src/lib/data/venezuela-2026.ts (lottt), NO se hardcodea.
 *
 * Entrada flexible: acepta fechaIngreso/fechaEgreso como fechas ISO (input
 * type="date"). Si las fechas no parsean, hay un fallback al input numérico
 * diasTotales (días totales de servicio), para no romper el cálculo.
 *
 * Fuente: LOTTT (INCES), Art. 190.
 */
import { VENEZUELA_2026, diasVacacionesLottt } from '../data/venezuela-2026';

export interface Inputs {
  fechaIngreso?: string; // ISO (YYYY-MM-DD)
  fechaEgreso?: string;  // ISO (YYYY-MM-DD)
  diasTotales?: number;  // fallback: días totales de servicio
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

function parseISO(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function antiguedadLaboralVenezuela(i: Inputs): Outputs {
  const ing = parseISO(i.fechaIngreso);
  const egr = parseISO(i.fechaEgreso);

  let diffDias: number;
  if (ing && egr) {
    diffDias = Math.round((egr.getTime() - ing.getTime()) / 86400000);
    if (diffDias < 0) throw new Error('La fecha de egreso no puede ser anterior a la de ingreso');
  } else {
    diffDias = Math.max(0, Math.floor(Number(i.diasTotales) || 0));
    if (!diffDias) throw new Error('Ingresá la fecha de ingreso y de egreso (o los días totales de servicio)');
  }

  const anios = Math.floor(diffDias / 365.25);
  const resto = diffDias - anios * 365.25;
  const meses = Math.floor(resto / 30.44);
  const dias = Math.round(resto - meses * 30.44);

  const diasVacaciones = diasVacacionesLottt(anios);

  const narrativa =
    `Tu antigüedad es de ${anios} año(s), ${meses} mes(es) y ${dias} día(s) ` +
    `(${diffDias.toLocaleString('de-DE')} días totales de servicio). ` +
    `Según el Art. 190 de la LOTTT te corresponden ${diasVacaciones} días hábiles de vacaciones ` +
    `por año (15 el primer año + 1 día por cada año adicional, tope 30).`;

  const l = VENEZUELA_2026.lottt;
  const tablaRows = [
    ['1 año', `${diasVacacionesLottt(1)} días`],
    ['2 años', `${diasVacacionesLottt(2)} días`],
    ['5 años', `${diasVacacionesLottt(5)} días`],
    ['10 años', `${diasVacacionesLottt(10)} días`],
    ['15 años', `${diasVacacionesLottt(15)} días`],
    [`${l.vacacionesDiasMax - l.vacacionesDiasBase + 1} años o más`, `${l.vacacionesDiasMax} días (tope)`],
  ];

  return {
    antiguedad: `${anios} año(s), ${meses} mes(es) y ${dias} día(s)`,
    anios,
    meses,
    dias,
    diasVacaciones,
    _insight: {
      type: 'highlight',
      icon: '📆',
      text: narrativa,
    },
    _table: {
      title: 'Vacaciones por antigüedad (LOTTT Art. 190)',
      headers: ['Antigüedad', 'Días hábiles de vacaciones'],
      rows: tablaRows,
      note: 'El primer año corresponden 15 días hábiles; a partir del segundo año se suma 1 día por cada año de servicio, con un tope de 30 días (Art. 190 LOTTT). El bono vacacional sigue una progresión equivalente (Art. 192).',
    },
  };
}
