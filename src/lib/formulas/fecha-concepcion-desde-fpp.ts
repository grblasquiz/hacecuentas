// Calculadora de Fecha de Concepción desde FPP o FUM
// Fuente: ACOG Committee Opinion 700 (2017); OMS guías prenatales

export interface Inputs {
  input_type: string;      // 'fpp' | 'fum'
  reference_date: string;  // ISO date string YYYY-MM-DD
  cycle_length: number;    // días (típico: 21–45)
}

export interface Outputs {
  conception_date: string;    // ISO date YYYY-MM-DD
  conception_window: string;  // texto con rango
  gestational_age: string;    // texto "X semanas y Y días"
  fpp_display: string;        // ISO date YYYY-MM-DD
  ovulation_day: number;      // día del ciclo en que ocurrió la ovulación
}

// Constantes basadas en fisiología estándar (ACOG 2017)
const DAYS_CONCEPTION_TO_BIRTH = 266; // 38 semanas desde concepción
const DAYS_PREGNANCY_FROM_LMP = 280;  // 40 semanas desde FUM (regla de Naegele)
const STANDARD_CYCLE = 28;            // días de ciclo estándar
const OVULATION_DAY_STD = 14;         // día de ovulación en ciclo de 28 días
const WINDOW_MARGIN = 2;              // días ± para la ventana de concepción

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T12:00:00Z');
  if (isNaN(d.getTime())) return null;
  return d;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateReadable(date: Date): string {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return `${date.getUTCDate()} de ${months[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
}

export function compute(i: Inputs): Outputs {
  const defaultOutput: Outputs = {
    conception_date: '',
    conception_window: 'Ingresa una fecha válida para calcular.',
    gestational_age: 'No disponible',
    fpp_display: '',
    ovulation_day: OVULATION_DAY_STD
  };

  // Validar fecha
  const refDate = parseDate(i.reference_date);
  if (!refDate) {
    return {
      ...defaultOutput,
      conception_window: 'La fecha ingresada no es válida. Usa el formato YYYY-MM-DD.'
    };
  }

  // Validar largo de ciclo
  const cycleLength = Math.round(Number(i.cycle_length) || STANDARD_CYCLE);
  if (cycleLength < 18 || cycleLength > 60) {
    return {
      ...defaultOutput,
      conception_window: 'El largo del ciclo debe estar entre 18 y 60 días.'
    };
  }

  // Ajuste por ciclo distinto de 28 días
  const cycleAdjustment = cycleLength - STANDARD_CYCLE;
  // Día del ciclo en que ocurre la ovulación
  const ovulationDay = OVULATION_DAY_STD + cycleAdjustment;

  let conceptionDate: Date;
  let fppDate: Date;

  if (i.input_type === 'fum') {
    // Desde FUM: concepción ≈ FUM + día de ovulación
    conceptionDate = addDays(refDate, ovulationDay);
    fppDate = addDays(refDate, DAYS_PREGNANCY_FROM_LMP + cycleAdjustment);
  } else {
    // Desde FPP (default): concepción = FPP − 266 días + ajuste de ciclo
    fppDate = refDate;
    conceptionDate = addDays(fppDate, -(DAYS_CONCEPTION_TO_BIRTH - cycleAdjustment));
  }

  // Ventana de concepción
  const windowStart = addDays(conceptionDate, -WINDOW_MARGIN);
  const windowEnd = addDays(conceptionDate, WINDOW_MARGIN);

  // Edad gestacional actual (desde FUM equivalente)
  // FUM equivalente = concepción − días de ovulación
  const fumEquiv = addDays(conceptionDate, -ovulationDay);
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12));
  const diffMs = todayUtc.getTime() - fumEquiv.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let gestationalAgeText: string;
  if (diffDays < 0) {
    gestationalAgeText = 'La fecha está en el futuro; la edad gestacional no está disponible aún.';
  } else if (diffDays > 320) {
    gestationalAgeText = 'El embarazo habría concluido (más de 45 semanas calculadas).';
  } else {
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    if (days === 0) {
      gestationalAgeText = `${weeks} semana${weeks !== 1 ? 's' : ''} exactas`;
    } else {
      gestationalAgeText = `${weeks} semana${weeks !== 1 ? 's' : ''} y ${days} día${days !== 1 ? 's' : ''}`;
    }
  }

  const conceptionWindow =
    `Del ${formatDateReadable(windowStart)} al ${formatDateReadable(windowEnd)}`;

  return {
    conception_date: formatDate(conceptionDate),
    conception_window: conceptionWindow,
    gestational_age: gestationalAgeText,
    fpp_display: formatDate(fppDate),
    ovulation_day: ovulationDay
  };
}
