export interface Inputs {
  weeks: number;
  days: number;
}

export interface Outputs {
  monthEquivalent: string;
  trimester: string;
  weeksRemaining: string;
  percentComplete: number;
  totalDays: number;
  summary: string;
}

// Full-term definition: 40 weeks = 280 days (ACOG standard)
const FULL_TERM_DAYS = 280;
const FULL_TERM_WEEKS = 40;

// Trimester boundaries (ACOG)
// 1st: weeks 1-13 (days 0-97)
// 2nd: weeks 14-27 (days 98-195)
// 3rd: weeks 28-40 (days 196-280)

function getMonth(totalDaysElapsed: number): string {
  // Pregnancy months of 28 days each (4 weeks per month)
  // Month 1: days 1-28   (weeks 1-4w6d)
  // Month 2: days 29-56  (weeks 5-8w6d)
  // Month 3: days 57-91  (weeks 9-13w6d)
  // Month 4: days 92-119 (weeks 14-17w6d)
  // Month 5: days 120-147(weeks 18-21w6d)
  // Month 6: days 148-182(weeks 22-26w6d)
  // Month 7: days 183-210(weeks 27-30w6d)
  // Month 8: days 211-245(weeks 31-35w6d)
  // Month 9: days 246-280(weeks 36-40w)
  const monthMap: Array<{ maxWeek: number; month: number }> = [
    { maxWeek: 4,  month: 1 },
    { maxWeek: 8,  month: 2 },
    { maxWeek: 13, month: 3 },
    { maxWeek: 17, month: 4 },
    { maxWeek: 21, month: 5 },
    { maxWeek: 26, month: 6 },
    { maxWeek: 30, month: 7 },
    { maxWeek: 35, month: 8 },
    { maxWeek: 40, month: 9 },
  ];
  const currentWeek = Math.floor(totalDaysElapsed / 7);
  for (const entry of monthMap) {
    if (currentWeek <= entry.maxWeek) {
      return `Month ${entry.month}`;
    }
  }
  return `Month 9+`;
}

function getTrimester(totalDaysElapsed: number): string {
  // 1st trimester: days 0 – 97 (weeks 1–13w6d)
  // 2nd trimester: days 98 – 195 (weeks 14–27w6d)
  // 3rd trimester: days 196 – 280 (weeks 28–40)
  if (totalDaysElapsed <= 0) return "Not yet pregnant (week 0)";
  if (totalDaysElapsed <= 97)  return "1st Trimester (Weeks 1–13)";
  if (totalDaysElapsed <= 195) return "2nd Trimester (Weeks 14–27)";
  if (totalDaysElapsed <= 280) return "3rd Trimester (Weeks 28–40)";
  return "Post-Term (Past 40 Weeks)";
}

export function compute(i: Inputs): Outputs {
  const rawWeeks = Number(i.weeks);
  const rawDays  = Number(i.days) || 0;

  // Defensive clamp
  const w = isNaN(rawWeeks) || rawWeeks < 0 ? 0 : Math.floor(rawWeeks);
  const d = isNaN(rawDays)  || rawDays  < 0 ? 0 : Math.min(Math.floor(rawDays), 6);

  if (w === 0 && d === 0) {
    return {
      monthEquivalent: "—",
      trimester: "Enter your current week to begin",
      weeksRemaining: "—",
      percentComplete: 0,
      totalDays: 0,
      summary: "Enter your current week of pregnancy (and optional extra days) above.",
    };
  }

  const totalDays = w * 7 + d;

  // Percent complete (can exceed 100 if post-term)
  const percentComplete = Math.round((totalDays / FULL_TERM_DAYS) * 1000) / 10;

  // Remaining
  const daysRemaining  = FULL_TERM_DAYS - totalDays;
  const weeksRem       = Math.abs(Math.floor(daysRemaining / 7));
  const daysRem        = Math.abs(daysRemaining % 7);

  let weeksRemainingStr: string;
  if (daysRemaining < 0) {
    weeksRemainingStr = `${weeksRem}w ${daysRem}d past due date`;
  } else if (daysRemaining === 0) {
    weeksRemainingStr = "0w 0d — Due date reached!";
  } else {
    weeksRemainingStr = `${weeksRem}w ${daysRem}d`;
  }

  const monthEquivalent = getMonth(totalDays);
  const trimester       = getTrimester(totalDays);

  // Build summary
  const weekLabel = d > 0 ? `${w} weeks ${d} days` : `${w} weeks`;
  let summaryLine: string;
  if (daysRemaining > 0) {
    summaryLine = `You are ${weekLabel} pregnant (${monthEquivalent}, ${trimester}). ${weeksRemainingStr} remaining until your 40-week due date.`;
  } else if (daysRemaining === 0) {
    summaryLine = `You are exactly 40 weeks pregnant — your estimated due date has arrived! (${trimester})`;
  } else {
    summaryLine = `You are ${weekLabel} pregnant — ${weeksRemainingStr}. (${trimester})`;
  }

  return {
    monthEquivalent,
    trimester,
    weeksRemaining: weeksRemainingStr,
    percentComplete,
    totalDays,
    summary: summaryLine,
  };
}
