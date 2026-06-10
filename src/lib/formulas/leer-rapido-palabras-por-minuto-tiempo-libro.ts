export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function leerRapidoPalabrasPorMinutoTiempoLibro(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  // wpm = reading speed (words per minute); words = total word count of the book.
  // Fallback v1/v2: índices/HTML viejos en caché todavía postean los ids
  // genéricos v1 (palabras) y v2 (wpm) — sin esto la calc devolvía siempre 0.
  const wpm = Math.max(Number(i.wpm) || Number(i.v2) || 0, 1);
  const words = Math.max(Number(i.words) || Number(i.v1) || 0, 0);

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

  // Escala de velocidad lectora (referencias: Brysbaert 2019 — adulto promedio
  // ~238 wpm; perfiles de la tabla del calc).
  const _chart = {
    type: 'scale',
    marker: wpm,
    markerLabel: __lang === 'en' ? `${wpm} WPM` : `${wpm} ppm`,
    min: 0,
    segments: __lang === 'en'
      ? [
          { nombre: 'Slow', max: 200, color: '#f59e0b', colorDark: '#fbbf24' },
          { nombre: 'Average', max: 250, color: '#84cc16', colorDark: '#a3e635' },
          { nombre: 'College', max: 350, color: '#22c55e', colorDark: '#4ade80' },
          { nombre: 'Advanced', max: 500, color: '#16a34a', colorDark: '#22c55e' },
          { nombre: 'Speed reading', max: Math.max(700, wpm), color: '#0ea5e9', colorDark: '#38bdf8' },
        ]
      : [
          { nombre: 'Lenta', max: 200, color: '#f59e0b', colorDark: '#fbbf24' },
          { nombre: 'Promedio', max: 250, color: '#84cc16', colorDark: '#a3e635' },
          { nombre: 'Universitario', max: 350, color: '#22c55e', colorDark: '#4ade80' },
          { nombre: 'Avanzado', max: 500, color: '#16a34a', colorDark: '#22c55e' },
          { nombre: 'Lect. rápida', max: Math.max(700, wpm), color: '#0ea5e9', colorDark: '#38bdf8' },
        ],
    ariaLabel: __lang === 'en'
      ? `Your reading speed of ${wpm} WPM on a 0–700 WPM scale (average adult: ~238 WPM).`
      : `Tu velocidad de ${wpm} palabras por minuto en una escala de 0 a 700 ppm (adulto promedio: ~238 ppm).`,
  };

  return {
    tiempo: timeStr,
    minutos: totalMinutesRounded,
    horas: totalHoursDecimal,
    resumen,
    _insight,
    _chart,
  };
}
