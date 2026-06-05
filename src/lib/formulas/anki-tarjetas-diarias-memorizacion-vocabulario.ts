export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ankiTarjetasDiariasMemorizacionVocabulario(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const totalCards = Number(i.v1) || 0;
  const days = Number(i.v2) || 1;

  // Core formula: new cards per day = total cards / days
  const newPerDay = totalCards / days;

  // Estimate steady-state review load (~7 reviews per new card in first 30 days)
  const reviewsPerDay = Math.round(newPerDay * 7);

  // Estimate daily time: ~25s per new card + ~10s per review
  const dailyMinutes = Math.round((newPerDay * 25 + reviewsPerDay * 10) / 60);

  const resultado = newPerDay.toFixed(1);

  let resumen: string;
  let insightText: string;

  if (__lang === 'en') {
    resumen = `${newPerDay.toFixed(1)} new cards/day → ~${reviewsPerDay} reviews/day at steady state (~${dailyMinutes} min/day total).`;
    insightText = `Adding **${newPerDay.toFixed(1)} new cards/day** generates about **${reviewsPerDay} reviews/day** once the deck matures (~day 21). Budget roughly **${dailyMinutes} minutes/day** for Anki.`;
  } else {
    resumen = `${newPerDay.toFixed(1)} tarjetas nuevas/día → ~${reviewsPerDay} revisiones/día en régimen estable (~${dailyMinutes} min/día en total).`;
    insightText = `Agregar **${newPerDay.toFixed(1)} tarjetas nuevas/día** genera aproximadamente **${reviewsPerDay} revisiones/día** cuando el deck madura (~día 21). Reservá unos **${dailyMinutes} minutos/día** para Anki.`;
  }

  const _insight = __lang === 'en'
    ? { title: 'Study plan', text: insightText, tone: 'neutral', icon: '🃏' }
    : { title: 'Plan de estudio', text: insightText, tone: 'neutral', icon: '🃏' };

  return { resultado, resumen, _insight };
}
