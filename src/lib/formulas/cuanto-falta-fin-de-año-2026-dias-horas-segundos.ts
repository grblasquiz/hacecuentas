export interface Inputs {
  target_date: 'fin_año' | 'año_nuevo';
}

export interface Outputs {
  days_remaining: number;
  weeks_remaining: number;
  months_remaining: number;
  hours_remaining: number;
  minutes_remaining: number;
  seconds_remaining: number;
  countdown_text: string;
}

export function compute(i: Inputs): Outputs {
  // Definir fecha objetivo según selección del usuario
  let targetDate: Date;
  if (i.target_date === 'año_nuevo') {
    targetDate = new Date(2027, 0, 1, 0, 0, 0, 0);
  } else {
    targetDate = new Date(2026, 11, 31, 23, 59, 59, 999);
  }

  // Obtener fecha y hora actual
  const now = new Date();

  // Calcular diferencia en milisegundos
  const diffMs = targetDate.getTime() - now.getTime();

  // Si la fecha ya pasó, retornar ceros
  if (diffMs <= 0) {
    return {
      days_remaining: 0,
      weeks_remaining: 0,
      months_remaining: 0,
      hours_remaining: 0,
      minutes_remaining: 0,
      seconds_remaining: 0,
      countdown_text: 'La fecha ya ha llegado'
    };
  }

  // Calcular unidades de tiempo
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Number((days / 30.44).toFixed(2));

  const hoursMs = diffMs % (1000 * 60 * 60 * 24);
  const hours = Math.floor(hoursMs / (1000 * 60 * 60));

  const minutesMs = diffMs % (1000 * 60 * 60);
  const minutes = Math.floor(minutesMs / (1000 * 60));

  const secondsMs = diffMs % (1000 * 60);
  const seconds = Math.floor(secondsMs / 1000);

  // Crear texto de cuenta regresiva
  const targetLabel = i.target_date === 'año_nuevo' ? '1 de enero de 2027' : '31 de diciembre de 2026';
  const countdownText = `${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos hasta ${targetLabel}`;

  return {
    days_remaining: days,
    weeks_remaining: weeks,
    months_remaining: months,
    hours_remaining: hours,
    minutes_remaining: minutes,
    seconds_remaining: seconds,
    countdown_text: countdownText
  };
}
