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
  _insight?: any;
  _chart?: any;
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

  const totalR = Math.round(total_hours * 100) / 100;
  const regR = Math.round(regular_hours * 100) / 100;
  const otR = Math.round(ot_hours * 100) / 100;
  const grossR = Math.round(gross_pay * 100) / 100;

  let insightText: string;
  let tone: 'good' | 'warn' | 'neutral';
  if (otR > 0) {
    insightText = `You logged **${totalR} hrs** this week — **${otR} hrs** are overtime (over the 40-hr FLSA threshold), paid at 1.5×.` +
      (grossR > 0 ? ` That brings gross pay to **$${grossR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**.` : '');
    tone = 'warn';
  } else {
    insightText = `You logged **${totalR} hrs** this week, all at regular rate — no overtime since you stayed at or below the 40-hr FLSA threshold.` +
      (grossR > 0 ? ` Gross pay comes to **$${grossR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**.` : '');
    tone = 'good';
  }
  const _insight = {
    title: 'Your week at a glance',
    text: insightText,
    tone,
    icon: '⏱️',
  };

  const _chart = totalR > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Regular hours', value: regR },
      { label: 'Overtime hours', value: otR },
    ],
    suffix: ' hrs',
    centerValue: totalR.toFixed(2) + ' hrs',
    centerLabel: 'Total',
    ariaLabel: `Weekly hours split: ${regR} regular and ${otR} overtime, ${totalR} total.`,
  } : undefined;

  return {
    total_hours: totalR,
    regular_hours: regR,
    ot_hours: otR,
    gross_pay: grossR,
    daily_breakdown,
    _insight,
    _chart,
  };
}
