// Calculadora Fecha Probable de Parto — Regla de Naegele con ajuste por ciclo
// Fuente: ACOG Committee Opinion 700 (2017), OMS Atención Prenatal (2016)

export interface Inputs {
  fum: string;        // fecha de última menstruación (ISO string o DD/MM/YYYY)
  cycle_length: number; // duración habitual del ciclo en días
}

export interface Outputs {
  fpp: string;               // Fecha Probable de Parto (YYYY-MM-DD)
  gestational_weeks: string; // Ej: "10 semanas y 3 días"
  days_remaining: number;    // días hasta la FPP desde hoy
  trimester: string;         // "1.er trimestre", "2.º trimestre", "3.er trimestre"
  milestone_t1: string;      // fin 1er trimestre sem 12 (YYYY-MM-DD)
  milestone_morpho: string;  // ecografía morfológica sem 20 (YYYY-MM-DD)
  milestone_viability: string; // viabilidad fetal sem 24 (YYYY-MM-DD)
  milestone_term: string;    // término temprano sem 37 (YYYY-MM-DD)
}

// Convierte string de fecha a objeto Date (acepta YYYY-MM-DD y DD/MM/YYYY)
function parseDate(raw: string): Date | null {
  if (!raw) return null;
  // ISO format
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return isNaN(d.getTime()) ? null : d;
  }
  // DD/MM/YYYY
  const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) {
    const d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    return isNaN(d.getTime()) ? null : d;
  }
  // Fallback: let Date try
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

// Formatea Date a YYYY-MM-DD
function formatISO(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Suma días a una fecha
function addDays(d: Date, days: number): Date {
  const result = new Date(d.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

// Devuelve fecha de inicio de hoy sin horas
function today(): Date {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

export function compute(i: Inputs): Outputs {
  const EMPTY_OUTPUT: Outputs = {
    fpp: "",
    gestational_weeks: "Ingresa una FUM válida",
    days_remaining: 0,
    trimester: "",
    milestone_t1: "",
    milestone_morpho: "",
    milestone_viability: "",
    milestone_term: "",
  };

  const fumDate = parseDate(i.fum);
  if (!fumDate) return EMPTY_OUTPUT;

  const cycleLength = Number(i.cycle_length) || 28;

  // Validación: ciclo entre 20 y 45 días (rango clínicamente razonable)
  if (cycleLength < 20 || cycleLength > 45) {
    return {
      ...EMPTY_OUTPUT,
      gestational_weeks: "Ingresa una duración de ciclo entre 20 y 45 días",
    };
  }

  // FUM no puede ser futura ni hace más de 10 meses
  const hoy = today();
  const diffFumHoy = Math.floor((hoy.getTime() - fumDate.getTime()) / 86400000);
  if (diffFumHoy < 0) {
    return {
      ...EMPTY_OUTPUT,
      gestational_weeks: "La FUM no puede ser una fecha futura",
    };
  }
  if (diffFumHoy > 300) {
    return {
      ...EMPTY_OUTPUT,
      gestational_weeks: "La FUM parece demasiado antigua (más de 300 días)",
    };
  }

  // --- Regla de Naegele con ajuste por ciclo ---
  // FPP base = FUM + 280 días (ciclo estándar de 28 días)
  // Ajuste = duración_ciclo - 28
  // FPP ajustada = FUM + 280 + (ciclo - 28) = FUM + 252 + ciclo
  const BASE_DAYS = 280; // semanas 40 × 7
  const cycleAdjustment = cycleLength - 28;
  const totalDays = BASE_DAYS + cycleAdjustment;

  const fppDate = addDays(fumDate, totalDays);

  // --- Semanas gestacionales desde hoy ---
  const daysElapsed = diffFumHoy;
  const weeksGest = Math.floor(daysElapsed / 7);
  const daysRemainder = daysElapsed % 7;

  let gestationalWeeks: string;
  if (weeksGest === 0 && daysRemainder === 0) {
    gestationalWeeks = "Semana 0 (hoy es la FUM)";
  } else if (daysRemainder === 0) {
    gestationalWeeks = `${weeksGest} semanas exactas`;
  } else {
    const diaStr = daysRemainder === 1 ? "día" : "días";
    gestationalWeeks = `${weeksGest} semanas y ${daysRemainder} ${diaStr}`;
  }

  // --- Días restantes hasta FPP ---
  const daysRemaining = Math.floor((fppDate.getTime() - hoy.getTime()) / 86400000);

  // --- Trimestre actual ---
  let trimester: string;
  if (weeksGest < 13) {
    trimester = "1.er trimestre (semanas 1–12)";
  } else if (weeksGest < 28) {
    trimester = "2.º trimestre (semanas 13–27)";
  } else if (weeksGest < 42) {
    trimester = "3.er trimestre (semanas 28–42)";
  } else {
    trimester = "Postérmino (más de 42 semanas)";
  }

  // --- Hitos gestacionales (calculados desde FUM) ---
  // Semana 12: fin del 1er trimestre → FUM + 84 días + ajuste ciclo
  // Los hitos se calculan en la escala ajustada al ciclo de la persona
  const milestone_t1_date = addDays(fumDate, 84 + cycleAdjustment);       // sem 12
  const milestone_morpho_date = addDays(fumDate, 140 + cycleAdjustment);  // sem 20
  const milestone_viability_date = addDays(fumDate, 168 + cycleAdjustment); // sem 24
  const milestone_term_date = addDays(fumDate, 259 + cycleAdjustment);    // sem 37

  return {
    fpp: formatISO(fppDate),
    gestational_weeks: gestationalWeeks,
    days_remaining: daysRemaining,
    trimester,
    milestone_t1: formatISO(milestone_t1_date),
    milestone_morpho: formatISO(milestone_morpho_date),
    milestone_viability: formatISO(milestone_viability_date),
    milestone_term: formatISO(milestone_term_date),
  };
}
