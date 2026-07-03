/**
 * Contexto de la home según el día (Fase 7 del plan finde).
 *
 * De lunes a jueves (y viernes temprano) la home prioriza intención de día hábil
 * (sueldo, impuestos, finanzas). Desde el viernes a la tarde y todo el fin de
 * semana muestra el módulo "¿Qué plan tenés este finde?".
 *
 * Función PURA y testeable: recibe la fecha y la timezone, NO llama a `new Date()`
 * internamente (así el componente puede pasarle `new Date()` una sola vez y los
 * tests pueden inyectar fechas fijas). Evita bugs de hidratación: el server y el
 * cliente calculan lo mismo si reciben la misma fecha.
 */

export type HomeDayType = 'weekday' | 'friday' | 'weekend';

/** Hora (0-23, en ART) a partir de la cual el viernes entra en "modo finde". */
export const DEFAULT_FRIDAY_CUTOFF_HOUR = 15;
export const DEFAULT_TIMEZONE = 'America/Argentina/Buenos_Aires';

/** 0=Dom, 1=Lun … 6=Sáb en la timezone dada. */
function tzParts(date: Date, timeZone: string): { weekday: number; hour: number } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const wdName = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  let hourStr = parts.find((p) => p.type === 'hour')?.value ?? '0';
  // Intl puede devolver "24" a medianoche en hour12:false; normalizar a 0.
  let hour = parseInt(hourStr, 10) % 24;
  if (Number.isNaN(hour)) hour = 0;
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { weekday: map[wdName] ?? 1, hour };
}

/**
 * Devuelve 'weekend' (sáb/dom), 'friday' (vie desde el corte) o 'weekday'.
 * @param date       instante a evaluar (ej. `new Date()` en el componente)
 * @param timeZone   IANA tz; default America/Argentina/Buenos_Aires
 * @param fridayCutoffHour  hora ART desde la que el viernes es "finde" (default 15)
 */
export function getHomeContextByDate(
  date: Date,
  timeZone: string = DEFAULT_TIMEZONE,
  fridayCutoffHour: number = DEFAULT_FRIDAY_CUTOFF_HOUR,
): HomeDayType {
  const { weekday, hour } = tzParts(date, timeZone);
  if (weekday === 6 || weekday === 0) return 'weekend'; // sábado o domingo
  if (weekday === 5 && hour >= fridayCutoffHour) return 'friday';
  return 'weekday';
}

/** ¿La home debe mostrar el módulo de finde? (viernes-tarde + fin de semana). */
export function isWeekendMode(dayType: HomeDayType): boolean {
  return dayType === 'friday' || dayType === 'weekend';
}
