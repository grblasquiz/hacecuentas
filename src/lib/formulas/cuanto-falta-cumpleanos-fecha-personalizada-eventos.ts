export interface Inputs {
  target_date: string;
  event_name?: string;
}

export interface Outputs {
  days_remaining: number;
  weeks_remaining: number;
  months_remaining: number;
  hours_remaining: number;
  time_breakdown: string;
  status_message: string;
}

export function compute(i: Inputs): Outputs {
  const targetDateStr = i.target_date || "2026-12-25";
  const eventName = i.event_name?.trim() || "el evento";

  let targetDate: Date;
  try {
    targetDate = new Date(targetDateStr + "T00:00:00Z");
    if (isNaN(targetDate.getTime())) {
      return {
        days_remaining: 0,
        weeks_remaining: 0,
        months_remaining: 0,
        hours_remaining: 0,
        time_breakdown: "Formato de fecha inválido",
        status_message: "Por favor ingresa una fecha válida (YYYY-MM-DD)"
      };
    }
  } catch {
    return {
      days_remaining: 0,
      weeks_remaining: 0,
      months_remaining: 0,
      hours_remaining: 0,
      time_breakdown: "Error al procesar la fecha",
      status_message: "Verifica que la fecha sea correcta"
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const timeDiff = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  const weeksRemaining = Math.floor(daysRemaining / 7);
  const monthsRemaining = daysRemaining / 30.44;
  const hoursRemaining = daysRemaining * 24;

  let statusMessage = "";
  let timeBreakdown = "";

  if (daysRemaining < 0) {
    const absDays = Math.abs(daysRemaining);
    statusMessage = `${eventName} fue hace ${absDays} día${absDays !== 1 ? "s" : ""}`;
    timeBreakdown = `Tiempo transcurrido: ${absDays} días (${Math.floor(absDays / 7)} semanas, ${(absDays / 30.44).toFixed(1)} meses)`;
  } else if (daysRemaining === 0) {
    statusMessage = `¡Hoy es el día de ${eventName}!`;
    timeBreakdown = "Hora 0 - ¡El momento ha llegado!";
  } else if (daysRemaining === 1) {
    statusMessage = `Falta 1 día para ${eventName}`;
    timeBreakdown = `1 día = ${hoursRemaining} horas`;
  } else {
    statusMessage = `Faltan ${daysRemaining} días para ${eventName}`;
    const remainingDaysAfterWeeks = daysRemaining % 7;
    timeBreakdown = `${weeksRemaining} semana${weeksRemaining !== 1 ? "s" : ""} + ${remainingDaysAfterWeeks} día${remainingDaysAfterWeeks !== 1 ? "s" : ""} = ${daysRemaining} días totales (${(monthsRemaining).toFixed(1)} meses)`;
  }

  return {
    days_remaining: daysRemaining,
    weeks_remaining: weeksRemaining,
    months_remaining: Math.round(monthsRemaining * 100) / 100,
    hours_remaining: Math.max(0, hoursRemaining),
    time_breakdown: timeBreakdown,
    status_message: statusMessage
  };
}
