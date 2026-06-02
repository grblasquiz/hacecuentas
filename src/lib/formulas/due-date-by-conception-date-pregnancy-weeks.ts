export interface Inputs {
  conception_date: string; // ISO date string YYYY-MM-DD
  reference_method: string; // confirmed_intercourse | ovulation_tracking | fertility_clinic | ultrasound_dating
}

export interface Outputs {
  estimated_due_date: string; // ISO date string
  gestational_age_weeks: string; // "38w 3d" format
  weeks_from_conception: number; // decimal weeks
  days_until_due_date: number; // integer
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Validate and parse conception date
  const conceptionDate = new Date(i.conception_date);
  if (isNaN(conceptionDate.getTime())) {
    return {
      estimated_due_date: "",
      gestational_age_weeks: "Invalid date",
      weeks_from_conception: 0,
      days_until_due_date: 0
    };
  }

  // Calculate estimated due date: conception date + 266 days
  const DUE_DATE_DAYS = 266; // Gestational age from conception to delivery
  const eddDate = new Date(conceptionDate);
  eddDate.setDate(eddDate.getDate() + DUE_DATE_DAYS);

  // Get today's date for gestational age calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  conceptionDate.setHours(0, 0, 0, 0);
  eddDate.setHours(0, 0, 0, 0);

  // Calculate days elapsed since conception
  const daysElapsed = Math.floor((today.getTime() - conceptionDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate gestational age in weeks and days
  const weeksElapsed = Math.floor(daysElapsed / 7);
  const extraDays = daysElapsed % 7;
  const gestationalAgeWeeks = `${weeksElapsed}w ${extraDays}d`;

  // Calculate weeks from conception (decimal)
  const weeksFromConception = daysElapsed / 7;

  // Calculate days until due date
  const daysUntilDueDate = Math.floor((eddDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Format due date as ISO string (YYYY-MM-DD)
  const eddYear = eddDate.getFullYear();
  const eddMonth = String(eddDate.getMonth() + 1).padStart(2, '0');
  const eddDay = String(eddDate.getDate()).padStart(2, '0');
  const estimatedDueDate = `${eddYear}-${eddMonth}-${eddDay}`;

  // Clinical gestational age (LMP convention) = weeks since conception + 2
  const gaWeeksLmp = Math.max(0, weeksElapsed + 2);
  const eddLabel = eddDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const daysClamped = Math.max(0, daysUntilDueDate);

  let trimester: string;
  if (gaWeeksLmp <= 13) trimester = 'first trimester';
  else if (gaWeeksLmp <= 27) trimester = 'second trimester';
  else trimester = 'third trimester';

  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  let insightText: string;
  if (daysElapsed < 0) {
    insightText = `Conception hasn't happened yet based on the date entered. The **estimated due date** would be **${eddLabel}**.`;
    tone = 'neutral';
  } else if (gaWeeksLmp > 42) {
    insightText = `The due date (**${eddLabel}**) passed a while ago: this is post-term, so prompt medical follow-up is advised.`;
    tone = 'warn';
  } else if (gaWeeksLmp >= 37) {
    insightText = `At **${gestationalAgeWeeks}** since conception you're **at term** (clinical week ${gaWeeksLmp}): the baby could arrive any day. **Due date: ${eddLabel}**.`;
    tone = 'good';
  } else {
    insightText = `You're **${gestationalAgeWeeks}** along since conception (~clinical week ${gaWeeksLmp}, ${trimester}). **${daysClamped} days** to go until the estimated due date: **${eddLabel}**.`;
    tone = 'neutral';
  }

  const _insight = {
    title: 'Your estimated due date',
    text: insightText,
    tone,
    icon: '🤰',
  };

  const _chart = {
    type: 'scale' as const,
    marker: gaWeeksLmp,
    markerLabel: `Week ${gaWeeksLmp}`,
    min: 0,
    unit: 'wk',
    segments: [
      { nombre: '1st trim.', max: 13, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: '2nd trim.', max: 27, color: '#fef9c3', colorDark: '#854d0e' },
      { nombre: '3rd trim.', max: 37, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'At term', max: Math.max(42, gaWeeksLmp + 1), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Pregnancy scale by trimester in clinical gestational weeks, current position week ${gaWeeksLmp}.`,
  };

  return {
    estimated_due_date: estimatedDueDate,
    gestational_age_weeks: gestationalAgeWeeks,
    weeks_from_conception: parseFloat(weeksFromConception.toFixed(2)),
    days_until_due_date: daysClamped,
    _insight,
    _chart,
  };
}
