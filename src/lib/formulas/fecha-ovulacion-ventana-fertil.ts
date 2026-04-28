// Calculadora de Fecha de Ovulación y Ventana Fértil
// Basada en: Ovulación = FUM + (Largo ciclo − 14)
// Fuente: OMS / ACOG guidelines

export interface Inputs {
  last_period_date: string; // fecha ISO YYYY-MM-DD
  cycle_length: number;     // días (21–35 rango normal)
}

export interface Outputs {
  ovulation_date: string;         // fecha ISO
  fertile_window_start: string;   // fecha ISO
  fertile_window_end: string;     // fecha ISO
  peak_days: string;              // texto descriptivo
  next_period_date: string;       // fecha ISO
  days_until_ovulation: number;   // puede ser negativo si ya pasó
}

// Constante clínica: fase lútea promedio = 14 días
// Fuente: OMS Selected Practice Recommendations 2024
const LUTEAL_PHASE_DAYS = 14;

// Días de fertilidad antes de la ovulación (supervivencia espermática)
const FERTILE_DAYS_BEFORE = 5;

// Días de fertilidad después de la ovulación (viabilidad del óvulo)
const FERTILE_DAYS_AFTER = 1;

// Días de pico antes de la ovulación
const PEAK_DAYS_BEFORE = 2;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateES(date: Date): string {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

export function compute(i: Inputs): Outputs {
  const defaultOutput: Outputs = {
    ovulation_date: '',
    fertile_window_start: '',
    fertile_window_end: '',
    peak_days: 'Ingresa una fecha válida para calcular.',
    next_period_date: '',
    days_until_ovulation: 0
  };

  // Validar fecha
  if (!i.last_period_date || i.last_period_date.trim() === '') {
    return { ...defaultOutput, peak_days: 'Ingresa la fecha del último período para calcular.' };
  }

  const fum = new Date(i.last_period_date + 'T00:00:00');
  if (isNaN(fum.getTime())) {
    return { ...defaultOutput, peak_days: 'La fecha ingresada no es válida.' };
  }

  // Validar largo de ciclo (rango clínico: 21–35 días)
  const cycleLength = Math.round(Number(i.cycle_length) || 28);
  if (cycleLength < 15 || cycleLength > 45) {
    return {
      ...defaultOutput,
      peak_days: `El ciclo de ${cycleLength} días está fuera del rango esperado (15–45 días). Verifica el dato.`
    };
  }

  // Cálculo principal
  // Ovulación = FUM + (ciclo − 14)
  const daysToOvulation = cycleLength - LUTEAL_PHASE_DAYS;
  const ovulationDate = addDays(fum, daysToOvulation);

  // Ventana fértil: ovulación −5 a ovulación +1
  const fertileStart = addDays(ovulationDate, -FERTILE_DAYS_BEFORE);
  const fertileEnd = addDays(ovulationDate, FERTILE_DAYS_AFTER);

  // Próxima menstruación
  const nextPeriod = addDays(fum, cycleLength);

  // Días de pico: 2 días antes, el día de ovulación
  const peak1 = addDays(ovulationDate, -PEAK_DAYS_BEFORE);
  const peak2 = addDays(ovulationDate, -(PEAK_DAYS_BEFORE - 1));
  const peakText = `${formatDateES(peak1)}, ${formatDateES(peak2)} y ${formatDateES(ovulationDate)}`;

  // Días hasta la ovulación desde hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilOvulation = Math.round(
    (ovulationDate.getTime() - today.getTime()) / msPerDay
  );

  return {
    ovulation_date: toISODateString(ovulationDate),
    fertile_window_start: toISODateString(fertileStart),
    fertile_window_end: toISODateString(fertileEnd),
    peak_days: peakText,
    next_period_date: toISODateString(nextPeriod),
    days_until_ovulation: daysUntilOvulation
  };
}
