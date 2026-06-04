export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Creatine Dosage Calculator — Loading & Maintenance by Body Weight
 *
 * Source: Kreider RB et al. (2017). "International Society of Sports Nutrition
 * position stand: safety and efficacy of creatine supplementation in exercise,
 * sport, and medicine." J Int Soc Sports Nutr 14:18.
 * DOI: 10.1186/s12970-017-0173-z
 *
 * Formula:
 *   Loading phase (5-7 days): 0.3 g/kg/day ÷ 4 doses
 *   Maintenance (ongoing):    0.03 g/kg/day, minimum 3 g, maximum 5 g
 */
export function creatinaDosisPesoCargaMantenimiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Inputs
  const peso = Number(i.peso_kg) || 0;
  const protocolo = String(i.protocolo || 'ambos');

  if (peso <= 0) {
    const err = __lang === 'en'
      ? 'Enter your body weight in kg to calculate your creatine dose.'
      : 'Ingresá tu peso corporal en kg para calcular tu dosis de creatina.';
    return {
      resultado: '-',
      resumen: err,
      _insight: {
        title: __lang === 'en' ? 'Missing weight' : 'Falta el peso',
        text: err,
        tone: 'neutral',
        icon: '⚖️',
      },
    };
  }

  // --- LOADING PHASE (0.3 g/kg/day, split into 4 doses) ---
  const cargaTotalDia = +(peso * 0.3).toFixed(1);          // g/day
  const cargaPorToma = +(cargaTotalDia / 4).toFixed(1);    // g per dose x4

  // --- MAINTENANCE PHASE (0.03 g/kg/day, clamped 3–5 g/day) ---
  const mantRaw = +(peso * 0.03).toFixed(2);
  const mantDia = Math.max(3, Math.min(5, mantRaw));       // practical 3-5 g/day

  // --- Build primary result & interpretation ---
  let resultado: string;
  let resumen: string;
  let insightTitle: string;
  let insightText: string;

  if (protocolo === 'carga') {
    resultado = __lang === 'en'
      ? `${cargaTotalDia} g/day (${cargaPorToma} g × 4 doses)`
      : `${cargaTotalDia} g/día (${cargaPorToma} g × 4 tomas)`;
    resumen = __lang === 'en'
      ? `Loading phase for ${peso} kg: take ${cargaTotalDia} g of creatine monohydrate per day for 5–7 days, split into 4 equal doses of ~${cargaPorToma} g (e.g. morning, midday, afternoon, evening). After loading, switch to ${mantDia} g/day ongoing maintenance. This protocol saturates muscle stores in 5–7 days.`
      : `Fase de carga para ${peso} kg: tomá ${cargaTotalDia} g de creatina monohidrato por día durante 5–7 días, repartidos en 4 tomas iguales de ~${cargaPorToma} g (mañana, mediodía, tarde, noche). Después de la carga, pasá a ${mantDia} g/día de mantenimiento continuo. Este protocolo satura los depósitos musculares en 5–7 días.`;
    insightTitle = __lang === 'en' ? 'Loading Phase' : 'Fase de Carga';
    insightText = __lang === 'en'
      ? `For **${peso} kg**: **${cargaTotalDia} g/day** for 5–7 days (4 × ${cargaPorToma} g), then **${mantDia} g/day** for life. You'll reach full muscle saturation in under a week.`
      : `Para **${peso} kg**: **${cargaTotalDia} g/día** por 5–7 días (4 × ${cargaPorToma} g), luego **${mantDia} g/día** de por vida. Saturás los depósitos musculares en menos de una semana.`;
  } else if (protocolo === 'mantenimiento') {
    resultado = __lang === 'en'
      ? `${mantDia} g/day (no loading phase)`
      : `${mantDia} g/día (sin fase de carga)`;
    resumen = __lang === 'en'
      ? `Maintenance-only protocol for ${peso} kg: take ${mantDia} g/day of creatine monohydrate every day, indefinitely. No loading phase. Muscle stores reach full saturation in 3–4 weeks at this dose. This is the most convenient approach and achieves the same long-term result as loading.`
      : `Protocolo sin carga para ${peso} kg: tomá ${mantDia} g/día de creatina monohidrato todos los días, sin interrupción. Sin fase de carga. Los depósitos musculares alcanzan saturación completa en 3–4 semanas. Es el método más cómodo y llega al mismo nivel final que la carga.`;
    insightTitle = __lang === 'en' ? 'Maintenance-Only Protocol' : 'Protocolo sin Carga';
    insightText = __lang === 'en'
      ? `For **${peso} kg**: **${mantDia} g/day**, every day. Full saturation in ~3–4 weeks. Simpler, fewer GI issues than loading — same end result.`
      : `Para **${peso} kg**: **${mantDia} g/día**, todos los días. Saturación completa en ~3–4 semanas. Más simple, menos molestias GI que la carga — mismo resultado final.`;
  } else {
    // ambos / default
    resultado = __lang === 'en'
      ? `Loading: ${cargaTotalDia} g/day × 5-7d → Maintenance: ${mantDia} g/day`
      : `Carga: ${cargaTotalDia} g/día × 5-7d → Mantenimiento: ${mantDia} g/día`;
    resumen = __lang === 'en'
      ? `For ${peso} kg — Loading (optional): ${cargaTotalDia} g/day for 5–7 days in 4 doses of ${cargaPorToma} g each. Then maintenance: ${mantDia} g/day indefinitely (0.03 g/kg ≈ ${mantRaw} g, clamped to practical 3–5 g range). Without loading, reach the same saturation in 3–4 weeks at ${mantDia} g/day.`
      : `Para ${peso} kg — Carga (opcional): ${cargaTotalDia} g/día por 5–7 días en 4 tomas de ${cargaPorToma} g cada una. Luego mantenimiento: ${mantDia} g/día indefinidamente (0,03 g/kg ≈ ${mantRaw} g, ajustado al rango práctico 3–5 g). Sin carga, alcanzás la misma saturación en 3–4 semanas tomando ${mantDia} g/día.`;
    insightTitle = __lang === 'en' ? 'Your Creatine Protocol' : 'Tu Protocolo de Creatina';
    insightText = __lang === 'en'
      ? `**${peso} kg body weight** → Loading: **${cargaTotalDia} g/day** (4 × ${cargaPorToma} g) for 5–7 days, then **${mantDia} g/day** ongoing. Or skip loading and go straight to **${mantDia} g/day** — same result in 3–4 weeks.`
      : `**${peso} kg de peso corporal** → Carga: **${cargaTotalDia} g/día** (4 × ${cargaPorToma} g) por 5–7 días, luego **${mantDia} g/día** de por vida. O saltate la carga y tomá **${mantDia} g/día** desde el día 1 — mismo resultado en 3–4 semanas.`;
  }

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone: 'positive',
    icon: '💊',
  };

  return { resultado, resumen, _insight };
}
