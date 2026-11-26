import { CORTES, JORNADA, RECARGOS } from '../hubs/co/horas-extras-y-recargos.ts';
import { FERIADOS_CO_2026 } from '../data/feriados-latam-2026.ts';
import { FERIADOS_CO_2027 } from '../data/feriados-latam-2027.ts';

const HOUR = 60;
const DAY = 24 * HOUR;
const FIRST_DATE = '2026-01-01';
const LAST_DATE = '2027-12-31';
const HOLIDAYS = new Set([...FERIADOS_CO_2026, ...FERIADOS_CO_2027].map(holiday => holiday.fecha));
const minutes = (time: string) => Number(time.slice(0, 2)) * HOUR + Number(time.slice(3));
const midnight = (date: string) => Date.parse(date + 'T00:00:00Z') / 60000;

type Turno = { date: string; start: string; end: string; extra: boolean };
type Planilla = {
  salary: number;
  week: string;
  rest: number;
  shifts: Turno[];
  fullRestRate?: boolean;
  weeklyHours?: number;
};

function interval(shift: Turno) {
  const start = minutes(shift.start);
  const end = minutes(shift.end);
  const day = midnight(shift.date);
  if (!Number.isFinite(day) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.end) || start === end) {
    throw new Error('Cada tramo necesita fecha y dos horas distintas.');
  }
  return { from: day + start, to: day + end + (end < start ? DAY : 0), extra: shift.extra };
}

export function planillaRecargos({ salary, week, rest, shifts, fullRestRate = false, weeklyHours }: Planilla) {
  if (!Number.isFinite(salary) || salary <= 0) throw new Error('Ingresá un salario mensual positivo.');
  const weekStart = midnight(week);
  const weekEnd = weekStart + 7 * DAY;
  if (!(weekStart >= midnight(FIRST_DATE) && weekEnd <= midnight(LAST_DATE) + DAY)) {
    throw new Error('Elegí una semana completa dentro de 2026 o 2027.');
  }
  const maxWeekly = weekEnd > midnight(CORTES.jornada42)
    ? JORNADA.horasSemanaDesde15Jul2026 : JORNADA.horasSemanaHasta14Jul2026;
  if (weeklyHours !== undefined && (!Number.isFinite(weeklyHours) || weeklyHours <= 0 || weeklyHours > maxWeekly)) {
    throw new Error('Las horas semanales acordadas deben estar entre 1 y ' + maxWeekly + ' para esa semana.');
  }
  if (!shifts.length) throw new Error('Agregá al menos un tramo trabajado.');
  const intervals = shifts.map(interval).sort((a, b) => a.from - b.from);
  if (intervals.some((item, index) => index > 0 && item.from < intervals[index - 1].to)) {
    throw new Error('Hay horarios superpuestos. Ajustá los tramos que coinciden.');
  }
  if (intervals.some(item => item.from < weekStart || item.to > weekEnd)) {
    throw new Error('Todos los tramos deben quedar en la semana. Dividí en medianoche los que la excedan.');
  }

  const segments = intervals.flatMap(({ from, to, extra }) => {
    const pieces = [];
    for (let cursor = from; cursor < to;) {
      const instant = new Date(cursor * 60000);
      const date = instant.toISOString().slice(0, 10);
      const time = cursor % DAY;
      const nightStart = RECARGOS.horaInicioNocturna * HOUR;
      const nocturnal = time < 6 * HOUR || time >= nightStart;
      const nextBoundary = time < 6 * HOUR ? 6 * HOUR : time < nightStart ? nightStart : DAY;
      const end = Math.min(to, cursor - time + nextBoundary);
      const hours = (end - cursor) / HOUR;
      const restOrHoliday = instant.getUTCDay() === rest || HOLIDAYS.has(date);
      const divisor = weeklyHours ? weeklyHours * 5 : date >= CORTES.jornada42
        ? JORNADA.divisorMensualDesde15Jul2026 : JORNADA.divisorMensualHasta14Jul2026;
      const restRate = fullRestRate || date >= CORTES.dominical100
        ? RECARGOS.dominicalFestivoDesde01Jul2027
        : date >= CORTES.dominical90 ? RECARGOS.dominicalFestivoDesde01Jul2026 : RECARGOS.dominicalFestivoHasta30Jun2026;
      const workRate = extra ? (nocturnal ? RECARGOS.extraNocturna : RECARGOS.extraDiurna) : nocturnal ? RECARGOS.nocturno : 0;
      const base = salary / divisor * hours;
      const recargo = base * (workRate + (restOrHoliday ? restRate : 0));
      pieces.push({ date, hours, extra, nocturnal, restOrHoliday, divisor, base, recargo });
      cursor = end;
    }
    return pieces;
  });
  const totals = segments.reduce((sum, item) => ({
    hours: sum.hours + item.hours,
    base: sum.base + item.base,
    recargo: sum.recargo + item.recargo,
    extraBase: sum.extraBase + (item.extra ? item.base : 0),
  }), { hours: 0, base: 0, recargo: 0, extraBase: 0 });
  return { segments, totals };
}
