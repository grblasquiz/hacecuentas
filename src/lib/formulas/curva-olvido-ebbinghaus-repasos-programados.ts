export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function curvaOlvidoEbbinghausRepasosProgramados(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const retention = Math.exp(-r);
  const retentionPct = Math.round(retention * 100);
  const rTxt = r.toFixed(2);

  // Determine urgency and next review suggestion
  const daysToReview80 = v2 * 0.2231; // days until 80% retention: S * ln(1/0.8)

  let urgency: string;
  let tone: string;
  if (__lang === 'en') {
    if (r <= 0.10) { urgency = `Retention ≈ ${retentionPct}% — excellent. You can wait ~${(daysToReview80 - v1).toFixed(1)} more days before reviewing.`; tone = 'success'; }
    else if (r <= 0.22) { urgency = `Retention ≈ ${retentionPct}% — above 80%. Plan your review within ${(daysToReview80 - v1).toFixed(1)} days to stay above the 80% threshold.`; tone = 'success'; }
    else if (r <= 0.51) { urgency = `Retention ≈ ${retentionPct}% — below 80%. Review recommended today or tomorrow.`; tone = 'warning'; }
    else if (r <= 1.00) { urgency = `Retention ≈ ${retentionPct}% — well below threshold. Review now to avoid relearning from scratch.`; tone = 'warning'; }
    else { urgency = `Retention ≈ ${retentionPct}% — near zero. Treat this as a new learning session.`; tone = 'alert'; }
  } else {
    if (r <= 0.10) { urgency = `Retención ≈ ${retentionPct}% — excelente. Podés esperar ~${(daysToReview80 - v1).toFixed(1)} días más antes de repasar.`; tone = 'success'; }
    else if (r <= 0.22) { urgency = `Retención ≈ ${retentionPct}% — sobre el 80%. Planificá repasar en ${(daysToReview80 - v1).toFixed(1)} días para mantenerte sobre el umbral del 80%.`; tone = 'success'; }
    else if (r <= 0.51) { urgency = `Retención ≈ ${retentionPct}% — bajo el 80%. Se recomienda repasar hoy o mañana.`; tone = 'warning'; }
    else if (r <= 1.00) { urgency = `Retención ≈ ${retentionPct}% — muy por debajo. Repasá ahora para no tener que volver a aprender desde cero.`; tone = 'warning'; }
    else { urgency = `Retención ≈ ${retentionPct}% — prácticamente cero. Tratá este material como un aprendizaje nuevo.`; tone = 'alert'; }
  }

  const resumen = __lang === 'en'
    ? `Forgetting exponent t/S = ${v1} / ${v2} = ${rTxt}. Estimated retention: R = e^(−${rTxt}) ≈ ${retentionPct}%. ${urgency}`
    : `Exponente de olvido t/S = ${v1} / ${v2} = ${rTxt}. Retención estimada: R = e^(−${rTxt}) ≈ ${retentionPct}%. ${urgency}`;

  const _insight = {
    title: __lang === 'en' ? `Retention ≈ ${retentionPct}%` : `Retención ≈ ${retentionPct}%`,
    text: __lang === 'en'
      ? `Forgetting exponent **${rTxt}** → estimated retention **${retentionPct}%**. ${urgency}`
      : `Exponente de olvido **${rTxt}** → retención estimada **${retentionPct}%**. ${urgency}`,
    tone,
    icon: retentionPct >= 80 ? '✅' : retentionPct >= 50 ? '⚠️' : '🔴',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
