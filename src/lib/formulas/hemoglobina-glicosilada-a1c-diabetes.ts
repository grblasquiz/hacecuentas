export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Hemoglobina Glicosilada A1c → Glucosa Media Estimada (GME / eAG)
 *
 * Fórmula de Nathan et al., ADAG Study Group — Diabetes Care 2008:
 *   eAG (mg/dL) = 28.7 × A1c(%) − 46.7   (R² = 0.84, n = 507)
 *   eAG (mmol/L) = 1.59 × A1c(%) − 2.59
 *
 * Criterios diagnósticos ADA 2026:
 *   Normal:        A1c < 5.7 %
 *   Prediabetes:   A1c 5.7 – 6.4 %
 *   Diabetes:      A1c ≥ 6.5 %
 *
 * Target ADA 2026 (adultos no embarazadas con T2D): A1c < 7 %
 *
 * Fuentes:
 *   - Nathan DM et al. Diabetes Care 2008;31(8):1473-1478. PMID 18540046
 *   - ADA Standards of Care in Diabetes 2026. Diabetes Care 2026;49(Suppl 1):S27-S49
 */
export function hemoglobinaGlicosiladaA1cDiabetes(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const a1c = Number(i.a1c);

  // Validación: la A1c fisiológicamente posible está entre 3 % y 20 %
  if (!isFinite(a1c) || a1c < 3 || a1c > 20) {
    const errorMsg = __lang === 'en'
      ? 'Enter a valid A1c between 3% and 20%.'
      : 'Ingresá un valor de A1c entre 3 % y 20 %.';
    return { resultado: '—', resumen: errorMsg };
  }

  // Fórmula ADAG / Nathan 2008
  const eagMgDl = 28.7 * a1c - 46.7;
  const eagMmol = 1.59 * a1c - 2.59;

  // Clasificación diagnóstica (ADA 2026)
  let clasificacion: string;
  let tone: 'positive' | 'warning' | 'neutral' | 'alert';
  let clasificacionEn: string;

  if (a1c < 5.7) {
    clasificacion = 'Normal (< 5,7 %)';
    clasificacionEn = 'Normal (< 5.7%)';
    tone = 'positive';
  } else if (a1c <= 6.4) {
    clasificacion = 'Prediabetes (5,7 – 6,4 %)';
    clasificacionEn = 'Prediabetes (5.7–6.4%)';
    tone = 'warning';
  } else {
    clasificacion = 'Diabetes (≥ 6,5 %)';
    clasificacionEn = 'Diabetes (≥ 6.5%)';
    tone = 'alert';
  }

  // Target ADA para adultos con diabetes (no embarazadas): A1c < 7 %
  let targetMsg: string;
  let targetMsgEn: string;
  if (a1c < 5.7) {
    targetMsg = 'Tu A1c está en rango normal. Mantené hábitos saludables para seguir así.';
    targetMsgEn = 'Your A1c is in the normal range. Maintain healthy habits.';
  } else if (a1c <= 6.4) {
    targetMsg = 'Zona de prediabetes. Sin tratamiento, el 15–30 % progresa a diabetes tipo 2 en 5 años. El Programa de Prevención de Diabetes (DPP) demostró que bajar un 7 % del peso corporal y realizar 150 min/semana de ejercicio reduce la progresión un 58 %.';
    targetMsgEn = 'Prediabetes range. Without intervention, 15–30% progress to type 2 diabetes within 5 years. The DPP showed 7% weight loss + 150 min/week of exercise reduces progression by 58%.';
  } else if (a1c < 7.0) {
    targetMsg = 'Rango de diabetes — dentro del objetivo ADA 2026 (< 7 %). Seguí el tratamiento indicado por tu médico.';
    targetMsgEn = 'Diabetes range — within ADA 2026 target (< 7%). Continue prescribed treatment.';
  } else if (a1c <= 8.0) {
    targetMsg = 'Por encima del objetivo ADA 2026 (< 7 % para adultos). Consultá con tu médico para ajustar el tratamiento.';
    targetMsgEn = 'Above ADA 2026 target (< 7% for adults). Discuss treatment adjustment with your doctor.';
  } else {
    targetMsg = 'A1c muy elevada. Riesgo acelerado de complicaciones microvasculares (retinopatía, nefropatía, neuropatía). Consultá con tu endocrinólogo a la brevedad.';
    targetMsgEn = 'Very high A1c. Accelerated risk of microvascular complications (retinopathy, nephropathy, neuropathy). See your endocrinologist promptly.';
  }

  const resultado = `${eagMgDl.toFixed(0)} mg/dL`;

  const resumen = __lang === 'en'
    ? `A1c ${a1c.toFixed(1)}% → eAG ${eagMgDl.toFixed(0)} mg/dL (${eagMmol.toFixed(1)} mmol/L) — ${clasificacionEn}`
    : `A1c ${a1c.toFixed(1)} % → GME ${eagMgDl.toFixed(0)} mg/dL (${eagMmol.toFixed(1)} mmol/L) — ${clasificacion}`;

  const _insight = {
    title: __lang === 'en' ? 'A1c interpretation' : 'Interpretación de tu A1c',
    text: __lang === 'en'
      ? `**A1c ${a1c.toFixed(1)}%** corresponds to an estimated average glucose of **${eagMgDl.toFixed(0)} mg/dL** (${eagMmol.toFixed(1)} mmol/L) — **${clasificacionEn}** per ADA 2026. ${targetMsgEn}\n\n*This is an educational tool — for diagnosis or treatment decisions, consult your physician.*`
      : `**A1c ${a1c.toFixed(1)} %** corresponde a una glucosa media estimada de **${eagMgDl.toFixed(0)} mg/dL** (${eagMmol.toFixed(1)} mmol/L) — **${clasificacion}** según ADA 2026. ${targetMsg}\n\n*Este resultado es orientativo — para diagnóstico o cambios de tratamiento, consultá a tu médico.*`,
    tone,
    icon: '🩸',
  };

  return { resultado, resumen, _insight };
}
