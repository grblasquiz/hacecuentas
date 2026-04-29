export interface Inputs {
  start_date: string;
  target_date: string;
  custom_date?: string;
}

export interface Outputs {
  total_days: number;
  sundays: number;
  saturdays: number;
  fridays: number;
  mondays: number;
  weeks_count: number;
  summary: string;
}

export function compute(i: Inputs): Outputs {
  let startDate: Date;
  let endDate: Date;

  try {
    startDate = new Date(i.start_date);
    if (isNaN(startDate.getTime())) {
      return {
        total_days: 0,
        sundays: 0,
        saturdays: 0,
        fridays: 0,
        mondays: 0,
        weeks_count: 0,
        summary: "Ingresa una fecha de inicio válida"
      };
    }
  } catch (e) {
    return {
      total_days: 0,
      sundays: 0,
      saturdays: 0,
      fridays: 0,
      mondays: 0,
      weeks_count: 0,
      summary: "Error en la fecha de inicio"
    };
  }

  if (i.target_date === "christmas") {
    endDate = new Date(2026, 11, 25);
  } else if (i.target_date === "new_year") {
    endDate = new Date(2027, 0, 1);
  } else if (i.target_date === "custom" && i.custom_date) {
    try {
      endDate = new Date(i.custom_date);
      if (isNaN(endDate.getTime())) {
        return {
          total_days: 0,
          sundays: 0,
          saturdays: 0,
          fridays: 0,
          mondays: 0,
          weeks_count: 0,
          summary: "Ingresa una fecha personalizada válida"
        };
      }
    } catch (e) {
      return {
        total_days: 0,
        sundays: 0,
        saturdays: 0,
        fridays: 0,
        mondays: 0,
        weeks_count: 0,
        summary: "Error en la fecha personalizada"
      };
    }
  } else {
    endDate = new Date(2026, 11, 25);
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const totalMs = endDate.getTime() - startDate.getTime();
  const totalDays = Math.floor(totalMs / msPerDay);

  if (totalDays < 0) {
    return {
      total_days: totalDays,
      sundays: 0,
      saturdays: 0,
      fridays: 0,
      mondays: 0,
      weeks_count: 0,
      summary: `La fecha objetivo es anterior a hoy (${Math.abs(totalDays)} días atrás)`
    };
  }

  const sundays = 0;
  const saturdays = 1;
  const fridays = 5;
  const mondays = 1;

  let countSundays = 0;
  let countSaturdays = 0;
  let countFridays = 0;
  let countMondays = 0;

  const current = new Date(startDate);
  current.setDate(current.getDate() + 1);

  for (let d = 0; d < totalDays; d++) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek === 0) countSundays++;
    else if (dayOfWeek === 6) countSaturdays++;
    else if (dayOfWeek === 5) countFridays++;
    else if (dayOfWeek === 1) countMondays++;
    current.setDate(current.getDate() + 1);
  }

  const weeksCount = parseFloat((totalDays / 7).toFixed(2));

  const targetDateStr = endDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const summary = `${totalDays} días hasta el ${targetDateStr}: ${countSundays} domingos, ${countSaturdays} sábados, ${countFridays} viernes, ${countMondays} lunes.`;

  return {
    total_days: totalDays,
    sundays: countSundays,
    saturdays: countSaturdays,
    fridays: countFridays,
    mondays: countMondays,
    weeks_count: weeksCount,
    summary: summary
  };
}
