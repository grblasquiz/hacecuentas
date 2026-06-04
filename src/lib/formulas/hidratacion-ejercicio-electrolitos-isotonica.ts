export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Sports Hydration & Electrolyte Calculator
 *
 * Based on ACSM Position Stand: Exercise and Fluid Replacement
 * (Medicine & Science in Sports & Exercise, 2007; updated guidelines 2023)
 *
 * Inputs:
 *   peso        — body weight before exercise (kg)
 *   duracion    — planned exercise duration (hours)
 *   intensidad  — sweat rate category: 'baja'|'moderada'|'alta'|'muy_alta'
 *   umbral      — max tolerated dehydration as % of body weight (default 2%)
 *
 * Outputs:
 *   resultado   — max safe fluid deficit (L), i.e. body_weight × umbral / 100
 *   resumen     — full hydration plan: total sweat loss, recommended intake/h, Na+ guidance
 */
export function hidratacionEjercicioElectrolitosIsotonica(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const peso = Number(i.peso) || 70;          // kg
  const duracion = Number(i.duracion) || 1;   // hours
  const umbral = Number(i.umbral) || 2;       // % of body weight

  // Sweat rate by intensity — ACSM ranges: 0.5–2.5 L/h
  // Using mid-point of each band as the working estimate
  const intensidad = String(i.intensidad || 'moderada');
  type SweatEntry = { rate: number; label_es: string; label_en: string };
  const sweatMap: Record<string, SweatEntry> = {
    baja:     { rate: 0.6,  label_es: 'baja (≈0.6 L/h)',     label_en: 'low (≈0.6 L/h)'     },
    moderada: { rate: 1.0,  label_es: 'moderada (≈1.0 L/h)', label_en: 'moderate (≈1.0 L/h)' },
    alta:     { rate: 1.5,  label_es: 'alta (≈1.5 L/h)',     label_en: 'high (≈1.5 L/h)'     },
    muy_alta: { rate: 2.0,  label_es: 'muy alta (≈2.0 L/h)', label_en: 'very high (≈2.0 L/h)' },
  };
  const sweatEntry = sweatMap[intensidad] ?? sweatMap['moderada'];
  const tasaSudor = sweatEntry.rate; // L/h

  // --- Core formula (ACSM) ---
  // 1. Max safe fluid deficit = body_weight × umbral% / 100
  const deficitMaximo = peso * umbral / 100;  // litros

  // 2. Estimated total sweat loss over session
  const perdidaSudorTotal = tasaSudor * duracion; // litros

  // 3. ACSM recommends replacing ~75-100% of sweat losses during exercise
  //    to stay within the umbral. Target 80% replacement during; rest post.
  const ingestaPorHora = tasaSudor * 0.80; // L/h to ingest during exercise

  // 4. Sodium recommendations (ACSM): 500–700 mg/L for exercise >60 min
  //    For sessions ≤60 min water is typically sufficient
  const sodioPorLitro = 600; // mg/L (mid-point of ACSM 500–700 range)
  const sodioTotal = Math.round(ingestaPorHora * duracion * sodioPorLitro); // mg total

  // 5. Did the estimated sweat loss exceed the safe deficit?
  const superaLimite = perdidaSudorTotal > deficitMaximo;

  // Format helpers
  const fmtL = (v: number) => v.toFixed(2);
  const fmtLh = (v: number) => (v * 1000).toFixed(0); // → mL/h for readability

  // --- Bilingual output ---
  if (__lang === 'en') {
    const ingestaLabel = ingestaPorHora < 1
      ? `${fmtLh(ingestaPorHora)} mL/hour`
      : `${fmtL(ingestaPorHora)} L/hour`;

    const warningLine = superaLimite
      ? `⚠️ Estimated sweat loss (${fmtL(perdidaSudorTotal)} L) exceeds your safe deficit (${fmtL(deficitMaximo)} L). Active hydration during the session is critical.`
      : `✅ Estimated sweat loss (${fmtL(perdidaSudorTotal)} L) stays within your safe limit — maintain steady fluid intake to stay comfortable.`;

    const sodioLine = duracion >= 1
      ? `Include electrolytes: target 400–800 mg sodium/hour (≈ ${sodioTotal} mg total for this session).`
      : `Water alone is sufficient for sessions under 60 minutes. No extra electrolytes needed.`;

    const resumen =
      `Your max safe fluid deficit is ${fmtL(deficitMaximo)} L (${umbral}% of ${peso} kg body weight). ` +
      `Sweat rate (${sweatEntry.label_en}) × ${duracion}h = estimated ${fmtL(perdidaSudorTotal)} L lost. ` +
      warningLine + ' ' +
      `Recommended intake during exercise: ${ingestaLabel}. ` +
      sodioLine +
      ` Post-session: drink 1.25–1.5× whatever you still need to replace.`;

    const _insight = {
      title: 'Your hydration plan',
      text:
        `Maximum safe deficit: **${fmtL(deficitMaximo)} L** (${umbral}% of body weight). ` +
        `At ${sweatEntry.label_en}, you lose ≈ **${fmtL(perdidaSudorTotal)} L** over ${duracion}h. ` +
        `Drink ≈ **${ingestaLabel}** during exercise. ` +
        (duracion >= 1 ? `Add sodium (≈ ${sodioTotal} mg total) via isotonic drink or electrolyte tabs to prevent hyponatremia.` : 'Water is enough for this short session.'),
      tone: superaLimite ? 'warning' : 'positive',
      icon: '💧',
    };

    return { resultado: fmtL(deficitMaximo), resumen, _insight };
  }

  // --- Español ---
  const ingestaLabel = ingestaPorHora < 1
    ? `${fmtLh(ingestaPorHora)} mL/hora`
    : `${fmtL(ingestaPorHora)} L/hora`;

  const warningLine = superaLimite
    ? `⚠️ La pérdida estimada de sudor (${fmtL(perdidaSudorTotal)} L) supera tu déficit seguro (${fmtL(deficitMaximo)} L). La hidratación activa durante la sesión es crítica.`
    : `✅ La pérdida estimada (${fmtL(perdidaSudorTotal)} L) está dentro de tu límite seguro — mantené una ingesta constante para estar cómodo.`;

  const sodioLine = duracion >= 1
    ? `Incluí electrolitos: apuntá a 400–800 mg de sodio/hora (≈ ${sodioTotal} mg totales para esta sesión).`
    : `El agua sola es suficiente para sesiones menores a 60 minutos. No necesitás electrolitos extra.`;

  const resumen =
    `Tu déficit hídrico máximo seguro es ${fmtL(deficitMaximo)} L (${umbral}% de ${peso} kg). ` +
    `Tasa de sudor (${sweatEntry.label_es}) × ${duracion}h = pérdida estimada de ${fmtL(perdidaSudorTotal)} L. ` +
    warningLine + ' ' +
    `Ingesta recomendada durante el ejercicio: ${ingestaLabel}. ` +
    sodioLine +
    ` Post-sesión: tomá 1,25–1,5× lo que todavía necesitás reponer.`;

  const _insight = {
    title: 'Tu plan de hidratación',
    text:
      `Déficit máximo seguro: **${fmtL(deficitMaximo)} L** (${umbral}% del peso corporal). ` +
      `Con sudoración ${sweatEntry.label_es} perdés ≈ **${fmtL(perdidaSudorTotal)} L** en ${duracion}h. ` +
      `Bebé ≈ **${ingestaLabel}** durante el ejercicio. ` +
      (duracion >= 1 ? `Sumá sodio (≈ ${sodioTotal} mg totales) vía bebida isotónica o tabletas de electrolitos para prevenir hiponatremia.` : 'El agua es suficiente para esta sesión corta.'),
    tone: superaLimite ? 'warning' : 'positive',
    icon: '💧',
  };

  return { resultado: fmtL(deficitMaximo), resumen, _insight };
}
