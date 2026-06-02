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
  _insight?: any;
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
  let _insight: any;

  if (daysRemaining < 0) {
    const absDays = Math.abs(daysRemaining);
    statusMessage = `${eventName} fue hace ${absDays} día${absDays !== 1 ? "s" : ""}`;
    timeBreakdown = `Tiempo transcurrido: ${absDays} días (${Math.floor(absDays / 7)} semanas, ${(absDays / 30.44).toFixed(1)} meses)`;
    _insight = {
      title: "La fecha ya pasó",
      text: `**${eventName}** fue hace **${absDays} día${absDays !== 1 ? "s" : ""}** (unas **${Math.floor(absDays / 7)} semanas**). Si querés contar para la próxima vez, cargá la fecha del año que viene.`,
      tone: "neutral",
      icon: "📅"
    };
  } else if (daysRemaining === 0) {
    statusMessage = `¡Hoy es el día de ${eventName}!`;
    timeBreakdown = "Hora 0 - ¡El momento ha llegado!";
    _insight = {
      title: "¡Es hoy!",
      text: `Hoy es el día de **${eventName}**. Llegaste justo: ¡a disfrutarlo!`,
      tone: "good",
      icon: "🎉"
    };
  } else if (daysRemaining === 1) {
    statusMessage = `Falta 1 día para ${eventName}`;
    timeBreakdown = `1 día = ${hoursRemaining} horas`;
    _insight = {
      title: "Falta 1 día",
      text: `Mañana es **${eventName}**: quedan **${hoursRemaining} horas**. Última chance para dejar todo listo.`,
      tone: "good",
      icon: "⏰"
    };
  } else {
    statusMessage = `Faltan ${daysRemaining} días para ${eventName}`;
    const remainingDaysAfterWeeks = daysRemaining % 7;
    timeBreakdown = `${weeksRemaining} semana${weeksRemaining !== 1 ? "s" : ""} + ${remainingDaysAfterWeeks} día${remainingDaysAfterWeeks !== 1 ? "s" : ""} = ${daysRemaining} días totales (${(monthsRemaining).toFixed(1)} meses)`;
    _insight = {
      title: `Faltan ${daysRemaining} días`,
      text: `Para **${eventName}** quedan **${daysRemaining} días** = **${weeksRemaining} semana${weeksRemaining !== 1 ? "s" : ""}** y ${remainingDaysAfterWeeks} día${remainingDaysAfterWeeks !== 1 ? "s" : ""} (${monthsRemaining.toFixed(1)} meses). Tiempo de sobra para planificar con calma.`,
      tone: "neutral",
      icon: "📅"
    };
  }

  return {
    days_remaining: daysRemaining,
    weeks_remaining: weeksRemaining,
    months_remaining: Math.round(monthsRemaining * 100) / 100,
    hours_remaining: Math.max(0, hoursRemaining),
    time_breakdown: timeBreakdown,
    status_message: statusMessage,
    _insight
  };
}
