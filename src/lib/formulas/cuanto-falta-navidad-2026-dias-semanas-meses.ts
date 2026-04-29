export interface Inputs {
  current_date: string;
  count_mode: string;
}

export interface Outputs {
  days_remaining: number;
  weeks_remaining: number;
  months_remaining: number;
  hours_remaining: number;
  minutes_remaining: number;
  formatted_time: string;
  weekends_count: number;
}

export function compute(i: Inputs): Outputs {
  const currentDateStr = i.current_date || new Date().toISOString().split('T')[0];
  const currentDate = new Date(currentDateStr + 'T00:00:00Z');
  const christmasDate = new Date('2026-12-25T00:00:00Z');

  if (isNaN(currentDate.getTime())) {
    return {
      days_remaining: 0,
      weeks_remaining: 0,
      months_remaining: 0,
      hours_remaining: 0,
      minutes_remaining: 0,
      formatted_time: 'Fecha inválida',
      weekends_count: 0
    };
  }

  const msDiff = christmasDate.getTime() - currentDate.getTime();
  const totalMs = Math.max(0, msDiff);

  let daysRemaining = 0;
  let weekendCount = 0;

  if (i.count_mode === 'all_days') {
    daysRemaining = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
    weekendCount = countWeekends(currentDate, christmasDate);
  } else if (i.count_mode === 'weekdays_only') {
    daysRemaining = countWeekdays(currentDate, christmasDate);
    weekendCount = 0;
  } else if (i.count_mode === 'sundays') {
    daysRemaining = countSundays(currentDate, christmasDate);
    weekendCount = daysRemaining;
  } else if (i.count_mode === 'weekend_days') {
    daysRemaining = countWeekendDays(currentDate, christmasDate);
    weekendCount = daysRemaining;
  } else {
    daysRemaining = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
    weekendCount = countWeekends(currentDate, christmasDate);
  }

  const weeksRemaining = Math.floor(daysRemaining / 7);
  const monthsRemaining = daysRemaining / 30.44;
  const hoursRemaining = daysRemaining * 24;
  const minutesRemaining = hoursRemaining * 60;

  let formattedTime = '';
  if (daysRemaining === 0) {
    formattedTime = '¡Hoy es Navidad!';
  } else if (daysRemaining === 1) {
    formattedTime = '1 día';
  } else if (daysRemaining > 7) {
    const remainderDays = daysRemaining % 7;
    if (remainderDays === 0) {
      formattedTime = `${weeksRemaining} semanas`;
    } else {
      formattedTime = `${weeksRemaining} semanas y ${remainderDays} días`;
    }
  } else {
    formattedTime = `${daysRemaining} días`;
  }

  return {
    days_remaining: daysRemaining,
    weeks_remaining: weeksRemaining,
    months_remaining: Math.round(monthsRemaining * 10) / 10,
    hours_remaining: Math.round(hoursRemaining),
    minutes_remaining: Math.round(minutesRemaining),
    formatted_time: formattedTime,
    weekends_count: weekendCount
  };
}

function countWeekends(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current < end) {
    const dayOfWeek = current.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      count++;
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return count;
}

function countWeekdays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current < end) {
    const dayOfWeek = current.getUTCDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return count;
}

function countSundays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current < end) {
    if (current.getUTCDay() === 0) {
      count++;
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return count;
}

function countWeekendDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current < end) {
    const dayOfWeek = current.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      count++;
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return count;
}
