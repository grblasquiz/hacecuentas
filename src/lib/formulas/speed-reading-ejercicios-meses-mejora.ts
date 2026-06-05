export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: any; }
export function speedReadingEjerciciosMesesMejora(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const gap = Math.max(0, Number(i.v1) || 0);   // WPM gap (target − current)
  const weeklyGain = Math.max(1, Number(i.v2) || 1); // WPM gained per week
  const weeks = gap > 0 ? gap / weeklyGain : 0;
  const months = weeks / 4.33;

  const weeksRounded = Math.ceil(weeks);
  const monthsStr = months.toFixed(1);

  let resumen: string;
  let insightText: string;

  if (__lang === 'en') {
    resumen = gap === 0
      ? `Enter your WPM gap and weekly gain to see the estimate.`
      : `${gap} WPM gap ÷ ${weeklyGain} WPM/week = ${weeksRounded} weeks (≈ ${monthsStr} months) of practice.`;
    insightText = gap === 0
      ? `Enter values above to get your personalized estimate.`
      : `At **${weeklyGain} WPM/week**, closing a **${gap}-WPM gap** takes **${weeksRounded} weeks** (about ${monthsStr} months) of consistent daily practice.`;
  } else {
    resumen = gap === 0
      ? `Ingresá tu brecha en PPM y tu ganancia semanal para obtener el estimado.`
      : `${gap} PPM ÷ ${weeklyGain} PPM/semana = ${weeksRounded} semanas (≈ ${monthsStr} meses) de práctica.`;
    insightText = gap === 0
      ? `Ingresá los valores para obtener tu estimado personalizado.`
      : `A **${weeklyGain} PPM/semana**, cerrar una brecha de **${gap} PPM** lleva **${weeksRounded} semanas** (aprox. ${monthsStr} meses) de práctica diaria consistente.`;
  }

  const _insight = {
    title: __lang === 'en' ? 'Your training timeline' : 'Tu plan de entrenamiento',
    text: insightText,
    tone: weeks <= 8 ? 'positive' as const : weeks <= 16 ? 'neutral' as const : 'warning' as const,
    icon: '📖',
  };

  return {
    resultado: weeksRounded.toString(),
    resumen,
    _insight,
  };
}
