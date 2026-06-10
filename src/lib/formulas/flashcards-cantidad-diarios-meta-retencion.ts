export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function flashcardsCantidadDiariosMetaRetencion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const rStr = r.toFixed(2);

  if (__lang !== 'en') {
    // Rama ES intacta (compartida con calculadora-flashcards-cantidad-diarios-meta-retencion)
    const resumen = `Tenés que repasar ${r.toFixed(0)} flashcards por día (${v1} repasos ÷ ${v2} días).`;
    const _insight = {
      title: "Resultado",
      text: `Dividir **${v1}** entre **${v2}** da **${rStr}** — la cantidad de flashcards por día que necesitás para alcanzar tu meta de retención a tiempo.`,
      tone: "neutral",
      icon: "🗂️",
    };
    return { resultado:rStr, resumen, _insight };
  }

  // EN branch — human summary + load-aware insight + scale chart
  const daily = Math.ceil(r);
  // ~20 seconds per card review is the widely cited SRS community benchmark
  const minutes = Math.max(1, Math.round((daily * 20) / 60));
  const resumen = `You need to review about ${daily} flashcards per day (${v1} total reviews ÷ ${v2} days) to finish on schedule — roughly ${minutes} minutes of daily practice at ~20 seconds per card.`;

  // Daily load: <=40 light (~13 min), 41-80 moderate, >80 heavy / burnout risk
  let tone: 'good' | 'neutral' | 'warn';
  let loadText: string;
  if (daily <= 40) {
    tone = 'good';
    loadText = `That's a light, sustainable load — about ${minutes} minutes a day. Consistency matters more than volume in spaced repetition: a small daily session beats a weekend marathon, because each review is timed to interrupt the forgetting curve.`;
  } else if (daily <= 80) {
    tone = 'neutral';
    loadText = `That's a moderate load of roughly ${minutes} minutes a day. Split it into two sessions (morning and evening) so fatigue doesn't degrade your recall accuracy, and avoid adding new cards on days you fall behind.`;
  } else {
    tone = 'warn';
    loadText = `Over 80 reviews a day (~${minutes} minutes) is hard to sustain for weeks. Consider extending your deadline, trimming the deck to the highest-yield cards, or accepting a lower first-pass retention target.`;
  }

  const _insight = {
    title: 'Your daily review load',
    text: `**${daily} cards/day** for **${v2} ${v2 === 1 ? 'day' : 'days'}** covers the **${v1} reviews** your goal requires. ${loadText}`,
    tone,
    icon: '🗂️',
  };

  const scaleTop = Math.max(120, Math.ceil(daily * 1.2));
  const _chart = {
    type: 'scale',
    marker: daily,
    markerLabel: `${daily} cards/day`,
    min: 0,
    segments: [
      { nombre: 'Light (≤40/day)', max: 40, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Moderate (41–80)', max: 80, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Heavy (80+)', max: scaleTop, color: '#dc2626', colorDark: '#f87171' },
    ],
    ariaLabel: `${daily} flashcard reviews needed per day`,
  };

  return { resultado:rStr, resumen, _insight, _chart };
}
