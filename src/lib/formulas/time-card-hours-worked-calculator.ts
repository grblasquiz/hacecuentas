export interface Inputs {
  mon_in: number;
  mon_out: number;
  mon_brk: number;
  tue_in: number;
  tue_out: number;
  tue_brk: number;
  wed_in: number;
  wed_out: number;
  wed_brk: number;
  thu_in: number;
  thu_out: number;
  thu_brk: number;
  fri_in: number;
  fri_out: number;
  fri_brk: number;
  sat_in: number;
  sat_out: number;
  sat_brk: number;
  sun_in: number;
  sun_out: number;
  sun_brk: number;
  hourly_rate: number;
}

export interface Outputs {
  total_hours: number;
  regular_hours: number;
  ot_hours: number;
  gross_pay: number;
  daily_breakdown: string;
}

// FLSA weekly overtime threshold — 29 U.S.C. § 207 (unchanged 2026)
const WEEKLY_OT_THRESHOLD = 40;

// FLSA overtime multiplier
const OT_MULTIPLIER = 1.5;

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dailyHours(
  clockIn: number,
  clockOut: number,
  breakMinutes: number
): number {
  const raw = (Number(clockOut) || 0) - (Number(clockIn) || 0);
  const breakHours = (Number(breakMinutes) || 0) / 60;
  const net = raw - breakHours;
  return net > 0 ? net : 0;
}

export function compute(i: Inputs): Outputs {
  const days: Array<{ inn: number; out: number; brk: number }> = [
    { inn: Number(i.mon_in) || 0, out: Number(i.mon_out) || 0, brk: Number(i.mon_brk) || 0 },
    { inn: Number(i.tue_in) || 0, out: Number(i.tue_out) || 0, brk: Number(i.tue_brk) || 0 },
    { inn: Number(i.wed_in) || 0, out: Number(i.wed_out) || 0, brk: Number(i.wed_brk) || 0 },
    { inn: Number(i.thu_in) || 0, out: Number(i.thu_out) || 0, brk: Number(i.thu_brk) || 0 },
    { inn: Number(i.fri_in) || 0, out: Number(i.fri_out) || 0, brk: Number(i.fri_brk) || 0 },
    { inn: Number(i.sat_in) || 0, out: Number(i.sat_out) || 0, brk: Number(i.sat_brk) || 0 },
    { inn: Number(i.sun_in) || 0, out: Number(i.sun_out) || 0, brk: Number(i.sun_brk) || 0 },
  ];

  const dailyTotals: number[] = days.map((d) =>
    dailyHours(d.inn, d.out, d.brk)
  );

  const total_hours = dailyTotals.reduce((sum, h) => sum + h, 0);

  const regular_hours = Math.min(total_hours, WEEKLY_OT_THRESHOLD);
  const ot_hours = Math.max(total_hours - WEEKLY_OT_THRESHOLD, 0);

  const rate = Number(i.hourly_rate) || 0;
  let gross_pay = 0;
  if (rate > 0) {
    gross_pay =
      regular_hours * rate + ot_hours * rate * OT_MULTIPLIER;
  }

  // Build daily breakdown string
  const lines = dailyTotals
    .map((h, idx) => {
      const hStr = h.toFixed(2);
      return `${DAY_NAMES[idx]}: ${hStr} hrs`;
    })
    .join(" | ");

  const daily_breakdown = lines;

  return {
    total_hours: Math.round(total_hours * 100) / 100,
    regular_hours: Math.round(regular_hours * 100) / 100,
    ot_hours: Math.round(ot_hours * 100) / 100,
    gross_pay: Math.round(gross_pay * 100) / 100,
    daily_breakdown,
  };
}
