export interface Inputs {
  conception_date: string; // ISO date string YYYY-MM-DD
  reference_method: string; // confirmed_intercourse | ovulation_tracking | fertility_clinic | ultrasound_dating
}

export interface Outputs {
  estimated_due_date: string; // ISO date string
  gestational_age_weeks: string; // "38w 3d" format
  weeks_from_conception: number; // decimal weeks
  days_until_due_date: number; // integer
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

  return {
    estimated_due_date: estimatedDueDate,
    gestational_age_weeks: gestationalAgeWeeks,
    weeks_from_conception: parseFloat(weeksFromConception.toFixed(2)),
    days_until_due_date: Math.max(0, daysUntilDueDate)
  };
}
