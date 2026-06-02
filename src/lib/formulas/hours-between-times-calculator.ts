export interface Inputs {
  start_time: string;  // "HH:MM" 24-hour format from select
  end_time: string;    // "HH:MM" 24-hour format from select
  break_minutes: number;
}

export interface Outputs {
  decimal_hours: number;
  hours_minutes: string;
  total_minutes: number;
  shift_note: string;
  _insight?: any;
}

/**
 * Parse a "HH:MM" string into total minutes since midnight.
 * Returns 0 on invalid input.
 */
function parseTimeToMinutes(time: string): number {
  if (!time || typeof time !== "string") return 0;
  const parts = time.split(":");
  if (parts.length !== 2) return 0;
  const hours = parseInt(parts[0], 10);
  const mins = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(mins)) return 0;
  if (hours < 0 || hours > 23 || mins < 0 || mins > 59) return 0;
  return hours * 60 + mins;
}

/**
 * Format total minutes as "H:MM" string.
 */
function formatHHMM(totalMinutes: number): string {
  if (totalMinutes < 0) return "0:00";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const mm = m < 10 ? "0" + m : String(m);
  return h + ":" + mm;
}

export function compute(i: Inputs): Outputs {
  const startMinutes = parseTimeToMinutes(i.start_time);
  const endMinutes = parseTimeToMinutes(i.end_time);
  const breakMins = Math.max(0, Math.floor(Number(i.break_minutes) || 0));

  // MINUTES_IN_DAY: 24 hours × 60 minutes — used to correct overnight shifts
  const MINUTES_IN_DAY = 1440;

  let diffMinutes = endMinutes - startMinutes;

  // Overnight shift correction: if end is earlier than start, add 24 hours
  let isOvernight = false;
  if (diffMinutes < 0) {
    diffMinutes += MINUTES_IN_DAY;
    isOvernight = true;
  }

  // Detect same-time input (could be 0 or 24 hrs — we treat as 0)
  const isSameTime = i.start_time === i.end_time;

  // Subtract break time; clamp to 0
  const netMinutes = Math.max(0, diffMinutes - breakMins);

  const decimalHours = Math.round((netMinutes / 60) * 100) / 100;
  const hoursMinutes = formatHHMM(netMinutes);
  const totalMinutes = netMinutes;

  // Build shift note
  let shiftNote: string;
  if (isSameTime && breakMins === 0) {
    shiftNote = "Start and end times are the same — duration is 0:00.";
  } else if (isOvernight) {
    shiftNote = breakMins > 0
      ? `Overnight shift detected (+24 h). Break of ${breakMins} min deducted.`
      : "Overnight shift detected — end time is on the next day.";
  } else {
    shiftNote = breakMins > 0
      ? `Same-day shift. Break of ${breakMins} min deducted.`
      : "Same-day shift.";
  }

  // Edge case: break longer than shift
  if (breakMins >= diffMinutes && diffMinutes > 0) {
    shiftNote += " Break time equals or exceeds shift length — net hours are 0.";
  }

  // Insight: interpret the net duration, accounting for break and overnight
  let _insight: any;
  if (isSameTime && breakMins === 0) {
    _insight = { title: "No duration", text: "Start and end times are identical, so the elapsed time is **0:00**. Set different times to measure a shift.", tone: "neutral", icon: "⏱️" };
  } else if (breakMins > 0 && netMinutes <= 0) {
    _insight = { title: "Break exceeds shift", text: `The **${breakMins}-min break** is as long as or longer than the elapsed time, so net worked hours come out to **0:00**.`, tone: "warn", icon: "⏱️" };
  } else {
    const grossHHMM = formatHHMM(diffMinutes);
    const overnightTxt = isOvernight ? " The clock crosses midnight, so a full 24 h was added to land on the next day." : "";
    const breakTxt = breakMins > 0
      ? ` After deducting the **${breakMins}-min break**, net time is **${hoursMinutes}** (**${decimalHours} h**) out of **${grossHHMM}** elapsed.`
      : ` That's **${hoursMinutes}** (**${decimalHours} h**) of elapsed time.`;
    _insight = { title: "Shift duration", text: `${breakTxt.trim()}${overnightTxt}`, tone: "neutral", icon: "⏱️" };
  }

  return {
    decimal_hours: decimalHours,
    hours_minutes: hoursMinutes,
    total_minutes: totalMinutes,
    shift_note: shiftNote,
    _insight,
  };
}
