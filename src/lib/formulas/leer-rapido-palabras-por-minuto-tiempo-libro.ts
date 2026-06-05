export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function leerRapidoPalabrasPorMinutoTiempoLibro(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  // wpm = reading speed (words per minute); words = total word count of the book
  const wpm = Math.max(Number(i.wpm) || 0, 1);
  const words = Math.max(Number(i.words) || 0, 0);

  // Core formula: Reading Time (minutes) = Total Words ÷ WPM
  const totalMinutes = words / wpm;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  // Format readable time string
  let timeStr: string;
  if (__lang === 'en') {
    if (hours === 0) {
      timeStr = `${minutes} min`;
    } else if (minutes === 0) {
      timeStr = `${hours} hr`;
    } else {
      timeStr = `${hours} hr ${minutes} min`;
    }
  } else {
    if (hours === 0) {
      timeStr = `${minutes} min`;
    } else if (minutes === 0) {
      timeStr = `${hours} h`;
    } else {
      timeStr = `${hours} h ${minutes} min`;
    }
  }

  const totalMinutesRounded = Math.round(totalMinutes);
  const totalHoursDecimal = (totalMinutes / 60).toFixed(1);

  const resumen = __lang === 'en'
    ? `At ${wpm} WPM, reading ${words.toLocaleString()} words takes ${totalMinutesRounded} minutes (${totalHoursDecimal} hours) — ${timeStr} of pure reading time.`
    : `A ${wpm} PPM, leer ${words.toLocaleString()} palabras lleva ${totalMinutesRounded} minutos (${totalHoursDecimal} horas) — ${timeStr} de tiempo puro de lectura.`;

  const _insight = {
    title: __lang === 'en' ? 'Reading Time Breakdown' : 'Desglose del tiempo de lectura',
    text: __lang === 'en'
      ? `**Formula:** ${words.toLocaleString()} words ÷ ${wpm} WPM = **${totalMinutesRounded} minutes** (${totalHoursDecimal} hours). Reading in 30-min daily sessions, you'd finish in **${Math.ceil(totalMinutes / 30)} sessions** (~${Math.ceil(totalMinutes / 30 / 7)} weeks).`
      : `**Fórmula:** ${words.toLocaleString()} palabras ÷ ${wpm} PPM = **${totalMinutesRounded} minutos** (${totalHoursDecimal} horas). Leyendo 30 min por día, terminarías en **${Math.ceil(totalMinutes / 30)} sesiones** (~${Math.ceil(totalMinutes / 30 / 7)} semanas).`,
    tone: 'positive',
    icon: '📘',
  };

  return {
    tiempo: timeStr,
    minutos: totalMinutesRounded,
    horas: totalHoursDecimal,
    resumen,
    _insight,
  };
}
