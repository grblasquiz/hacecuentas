export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Reading challenge calculator: books per month to hit an annual goal.
 * Inputs:
 *   v1 = annualGoal (total books to read in a year)
 *   v2 = monthsRemaining (months left in the reading period, default 12)
 * Derived outputs:
 *   booksPerMonth = annualGoal / monthsRemaining
 *   daysPerBook   = 30 / booksPerMonth  (how many days you have per book)
 *   minutesPerDay = (300 pages × 1.5 min/page × booksPerMonth) / 30 days
 *                 = 300 × 1.5 × booksPerMonth / 30 ≈ 15 × booksPerMonth
 *   (assumes avg 300 pages/book, avg reading speed ~1.5 min/page ≈ 250 wpm at ~250 words/page)
 */
export function leerMesLibrosMetaAnualReto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const annualGoal = Math.max(0, Number(i.v1) || 0);
  const months     = Math.max(1, Number(i.v2) || 12);

  const booksPerMonth = annualGoal / months;
  const daysPerBook   = booksPerMonth > 0 ? 30 / booksPerMonth : 0;
  const minutesPerDay = booksPerMonth * 15; // 300 pages × 1.5 min ÷ 30 days

  const bpmDisplay     = booksPerMonth.toFixed(1);
  const daysDisplay    = daysPerBook  > 0 ? Math.round(daysPerBook).toString() : '—';
  const minsDisplay    = minutesPerDay > 0 ? Math.round(minutesPerDay).toString() : '0';

  let resumen: string;
  let insightText: string;

  if (__lang === 'en') {
    resumen = `To read ${annualGoal} books in ${months} month${months === 1 ? '' : 's'}, you need ${bpmDisplay} book${booksPerMonth === 1 ? '' : 's'} per month — about ${minsDisplay} minutes of daily reading (avg. 300-page book at ~250 wpm).`;
    insightText = `**${bpmDisplay} books/month** — that's roughly **${daysDisplay} days per book** and **${minsDisplay} min/day** of reading (assuming ~300 pages per book at an average pace of 250 words per minute).`;
  } else {
    resumen = `Para leer ${annualGoal} libros en ${months} mes${months === 1 ? '' : 'es'} necesitás ${bpmDisplay} libro${booksPerMonth === 1 ? '' : 's'} por mes — aproximadamente ${minsDisplay} minutos diarios de lectura (libro promedio de 300 páginas a ~250 ppm).`;
    insightText = `**${bpmDisplay} libros/mes** — eso equivale a aproximadamente **${daysDisplay} días por libro** y **${minsDisplay} min/día** de lectura (estimado en ~300 páginas por libro a 250 palabras por minuto de promedio).`;
  }

  return {
    resultado: booksPerMonth.toFixed(2),
    booksPerMonth: bpmDisplay,
    daysPerBook:   daysDisplay,
    minutesPerDay: minsDisplay,
    resumen,
    _insight: {
      title: __lang === 'en' ? 'Your Reading Plan' : 'Tu plan de lectura',
      text: insightText,
      tone: booksPerMonth <= 1 ? 'positive' : booksPerMonth <= 3 ? 'neutral' : 'warning',
      icon: '📚',
    },
  };
}
