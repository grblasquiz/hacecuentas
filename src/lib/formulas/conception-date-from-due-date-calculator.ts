// Conception Date Calculator
// Sources: ACOG 2017 (gestational age from LMP), Wilcox et al. NEJM 1995 (fertile window)

export interface Inputs {
  input_method: string;  // 'due_date' | 'lmp'
  due_date: string;      // ISO date string, used when input_method === 'due_date'
  lmp_date: string;      // ISO date string, used when input_method === 'lmp'
  cycle_length: number;  // average cycle length in days
}

export interface Outputs {
  conception_date: string;   // ISO date or descriptive text
  fertile_window: string;    // e.g. "Oct 22 – Oct 26, 2025"
  gestational_age: string;   // e.g. "28 weeks, 2 days"
  lmp_result: string;        // ISO date
  due_date_result: string;   // ISO date
}

// Standard pregnancy length from LMP in days (Naegele's Rule)
const PREGNANCY_DAYS_FROM_LMP = 280;

// Standard cycle length assumed by Naegele's Rule
const STANDARD_CYCLE_DAYS = 28;

// Days before end of cycle that ovulation occurs (luteal phase length)
const LUTEAL_PHASE_DAYS = 14;

// Fertile window: sperm can survive up to 5 days; window = 4 days before ovulation + ovulation day
const FERTILE_WINDOW_DAYS_BEFORE = 4;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d;
}

function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
}

function gestationalAgeText(lmp: Date, today: Date): string {
  const diffMs = today.getTime() - lmp.getTime();
  if (diffMs < 0) return "LMP is in the future";
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  if (weeks === 0) return `${days} day${days !== 1 ? "s" : ""}`;
  return `${weeks} week${weeks !== 1 ? "s" : ""}, ${days} day${days !== 1 ? "s" : ""}`;
}

export function compute(i: Inputs): Outputs {
  const cycleLength = Math.round(Number(i.cycle_length)) || STANDARD_CYCLE_DAYS;
  const clampedCycle = Math.max(21, Math.min(45, cycleLength));

  // Cycle-length adjustment vs. standard 28-day cycle
  const cycleAdjustment = clampedCycle - STANDARD_CYCLE_DAYS;

  // Days from LMP to ovulation/conception
  const daysToOvulation = clampedCycle - LUTEAL_PHASE_DAYS;

  let lmp: Date | null = null;
  let edd: Date | null = null;

  if (i.input_method === "lmp") {
    lmp = parseDate(i.lmp_date);
    if (!lmp) {
      return {
        conception_date: "Enter a valid LMP date",
        fertile_window: "—",
        gestational_age: "—",
        lmp_result: "—",
        due_date_result: "—"
      };
    }
    // EDD = LMP + 280 - cycle_adjustment (i.e., adjusted Naegele)
    // Standard: EDD = LMP + 280; longer cycles push EDD later
    edd = addDays(lmp, PREGNANCY_DAYS_FROM_LMP + cycleAdjustment);
  } else {
    // input_method === 'due_date'
    edd = parseDate(i.due_date);
    if (!edd) {
      return {
        conception_date: "Enter a valid due date",
        fertile_window: "—",
        gestational_age: "—",
        lmp_result: "—",
        due_date_result: "—"
      };
    }
    // LMP = EDD - 280 - cycle_adjustment
    lmp = addDays(edd, -(PREGNANCY_DAYS_FROM_LMP + cycleAdjustment));
  }

  // Conception date = LMP + days to ovulation
  const conceptionDate = addDays(lmp, daysToOvulation);

  // Fertile window: 4 days before conception through conception day
  const fertileStart = addDays(conceptionDate, -FERTILE_WINDOW_DAYS_BEFORE);
  const fertileEnd = conceptionDate;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const gestAge = gestationalAgeText(lmp, today);

  const fertileWindowStr =
    `${formatDateDisplay(fertileStart)} – ${formatDateDisplay(fertileEnd)}`;

  return {
    conception_date: formatDateISO(conceptionDate),
    fertile_window: fertileWindowStr,
    gestational_age: gestAge,
    lmp_result: formatDateISO(lmp),
    due_date_result: formatDateISO(edd)
  };
}
