// Ovulation & Fertile Window Calculator
// Formula: Ovulation = LMP + (cycleLength - lutealPhase)
// Fertile window: ovulation - 5 to ovulation + 1
// Source: WHO Family Planning Guidance; NEJM 1995 (Wilcox et al.)

export interface Inputs {
  lmp_date: string;       // ISO date string e.g. "2026-06-01"
  cycle_length: number;   // days, typically 21-35
  luteal_phase: number;   // days, default 14
}

export interface Outputs {
  ovulation_date: string;        // ISO date
  fertile_window_start: string;  // ISO date
  fertile_window_end: string;    // ISO date
  peak_fertility_start: string;  // formatted text
  next_period_date: string;      // ISO date
  cycle_day_today: string;       // text description
  summary: string;               // plain text summary
}

// Default luteal phase length in days (clinically accepted range: 12-16)
const DEFAULT_LUTEAL_PHASE = 14;

// Minimum and maximum sperm survival window before ovulation (days)
const SPERM_SURVIVAL_DAYS = 5;

// Days after ovulation egg remains viable (conservative buffer)
const EGG_VIABLE_DAYS_AFTER = 1;

// Peak fertility window: days before ovulation (inclusive of ovulation day)
const PEAK_FERTILITY_DAYS_BEFORE = 2;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const EMPTY: Outputs = {
  ovulation_date: "",
  fertile_window_start: "",
  fertile_window_end: "",
  peak_fertility_start: "",
  next_period_date: "",
  cycle_day_today: "Enter your LMP date to see results.",
  summary: "Please enter a valid LMP date to calculate your fertile window.",
};

export function compute(i: Inputs): Outputs {
  // --- Input validation ---
  if (!i.lmp_date || String(i.lmp_date).trim() === "") {
    return EMPTY;
  }

  const lmpDate = new Date(i.lmp_date);
  if (isNaN(lmpDate.getTime())) {
    return {
      ...EMPTY,
      summary: "Invalid LMP date. Please enter a valid date.",
    };
  }

  const cycleLength = Number(i.cycle_length) || 28;
  const lutealPhase = Number(i.luteal_phase) > 0
    ? Number(i.luteal_phase)
    : DEFAULT_LUTEAL_PHASE;

  if (cycleLength < 18 || cycleLength > 60) {
    return {
      ...EMPTY,
      summary:
        "Cycle length should be between 18 and 60 days for a reliable estimate. Please review your input.",
    };
  }

  if (lutealPhase < 7 || lutealPhase > 21) {
    return {
      ...EMPTY,
      summary:
        "Luteal phase should be between 7 and 21 days. The typical value is 14 days.",
    };
  }

  // Prevent ovulation from being calculated before LMP
  const follicularPhase = cycleLength - lutealPhase;
  if (follicularPhase < 1) {
    return {
      ...EMPTY,
      summary:
        "Luteal phase cannot be longer than or equal to cycle length. Please check your inputs.",
    };
  }

  // --- Core calculations ---
  // Ovulation: LMP + follicular phase
  const ovulationDate = addDays(lmpDate, follicularPhase);

  // Fertile window: ovulation - 5 to ovulation + 1
  const fertileStart = addDays(ovulationDate, -SPERM_SURVIVAL_DAYS);
  const fertileEnd = addDays(ovulationDate, EGG_VIABLE_DAYS_AFTER);

  // Peak fertility: 2 days before ovulation through ovulation day
  const peakStart = addDays(ovulationDate, -PEAK_FERTILITY_DAYS_BEFORE);
  const peakEnd = ovulationDate;

  // Next period
  const nextPeriodDate = addDays(lmpDate, cycleLength);

  // Current cycle day (today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lmpDate.setHours(0, 0, 0, 0);
  const msDiff = today.getTime() - lmpDate.getTime();
  const daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));

  let cycleDayText: string;
  if (daysDiff < 0) {
    cycleDayText = `LMP is in the future (${Math.abs(daysDiff)} days from today). Adjust date if needed.`;
  } else if (daysDiff >= cycleLength) {
    const overBy = daysDiff - cycleLength + 1;
    cycleDayText = `Your next period was expected ${overBy} day(s) ago. You may be in cycle day ${daysDiff + 1} of an extended cycle.`;
  } else {
    const currentCycleDay = daysDiff + 1;
    // Determine fertility status
    const fertileStartDay = follicularPhase - SPERM_SURVIVAL_DAYS + 1;
    const fertileEndDay = follicularPhase + EGG_VIABLE_DAYS_AFTER + 1;
    const peakStartDay = follicularPhase - PEAK_FERTILITY_DAYS_BEFORE + 1;
    const ovulationDay = follicularPhase + 1;

    let status = "";
    if (currentCycleDay >= peakStartDay && currentCycleDay <= ovulationDay) {
      status = " — ⭐ Peak fertility";
    } else if (
      currentCycleDay >= fertileStartDay &&
      currentCycleDay <= fertileEndDay
    ) {
      status = " — Fertile window";
    } else if (currentCycleDay <= 5) {
      status = " — Menstrual phase";
    } else if (currentCycleDay > ovulationDay) {
      status = " — Post-ovulation (luteal phase)";
    }
    cycleDayText = `Cycle day ${currentCycleDay} of ${cycleLength}${status}`;
  }

  // Summary text
  const summary =
    `Estimated ovulation: ${formatDisplay(ovulationDate)}. ` +
    `Fertile window: ${formatDisplay(fertileStart)} – ${formatDisplay(fertileEnd)}. ` +
    `Peak fertility: ${formatDisplay(peakStart)} – ${formatDisplay(peakEnd)}. ` +
    `Next period expected: ${formatDisplay(nextPeriodDate)}.`;

  const peakFertilityText = `${formatDisplay(peakStart)} – ${formatDisplay(peakEnd)}`;

  return {
    ovulation_date: formatISO(ovulationDate),
    fertile_window_start: formatISO(fertileStart),
    fertile_window_end: formatISO(fertileEnd),
    peak_fertility_start: peakFertilityText,
    next_period_date: formatISO(nextPeriodDate),
    cycle_day_today: cycleDayText,
    summary,
  };
}
