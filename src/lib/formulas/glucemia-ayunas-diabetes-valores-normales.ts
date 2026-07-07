export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Fasting blood glucose classifier.
 * Reference: ADA Standards of Care in Diabetes 2026, WHO Diabetes Criteria.
 * Inputs:
 *   glucemia  — fasting glucose reading (number)
 *   unidad    — 'mgdl' | 'mmoll' (string select)
 * Outputs:
 *   resultado — category label string
 *   resumen   — detailed interpretation string
 */
export function glucemiaAyunasDiabetesValoresNormales(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const rawGlucemia = Number(i.glucemia) || 0;
  const unidad = String(i.unidad || 'mgdl');

  // Convert to mg/dL for classification
  // 1 mmol/L = 18.016 mg/dL
  const glucemiaMgdl = unidad === 'mmoll' ? rawGlucemia * 18.016 : rawGlucemia;

  // Reference ranges (ADA 2026 / WHO, plasma venous, adults non-pregnant)
  // Hypoglycemia: < 70 mg/dL
  // Normal:       70–99 mg/dL
  // Prediabetes:  100–125 mg/dL  (Impaired Fasting Glucose)
  // Diabetes:     ≥ 126 mg/dL

  type Category = 'hipoglucemia' | 'normal' | 'prediabetes' | 'diabetes_alto' | 'error';

  let category: Category;
  if (rawGlucemia <= 0) {
    category = 'error';
  } else if (glucemiaMgdl < 70) {
    category = 'hipoglucemia';
  } else if (glucemiaMgdl <= 99) {
    category = 'normal';
  } else if (glucemiaMgdl <= 125) {
    category = 'prediabetes';
  } else {
    category = 'diabetes_alto';
  }

  // mmol/L equivalents (rounded to 1 decimal)
  const glucemiaMmoll = unidad === 'mmoll' ? rawGlucemia : rawGlucemia / 18.016;
  const mmolStr = glucemiaMmoll.toFixed(1);
  const mgdlStr = Math.round(glucemiaMgdl).toString();

  const labels: Record<Category, { es: string; en: string }> = {
    error: {
      es: 'Ingresá un valor válido',
      en: 'Enter a valid value',
    },
    hipoglucemia: {
      es: `Hipoglucemia (< 70 mg/dL / < 3.9 mmol/L)`,
      en: `Hypoglycemia (< 70 mg/dL / < 3.9 mmol/L)`,
    },
    normal: {
      es: `Normal (70–99 mg/dL / 3.9–5.5 mmol/L)`,
      en: `Normal (70–99 mg/dL / 3.9–5.5 mmol/L)`,
    },
    prediabetes: {
      es: `Prediabetes – Glucemia alterada en ayunas (100–125 mg/dL / 5.6–6.9 mmol/L)`,
      en: `Prediabetes – Impaired Fasting Glucose (100–125 mg/dL / 5.6–6.9 mmol/L)`,
    },
    diabetes_alto: {
      es: `Criterio de diabetes (≥ 126 mg/dL / ≥ 7.0 mmol/L)`,
      en: `Diabetes threshold (≥ 126 mg/dL / ≥ 7.0 mmol/L)`,
    },
  };

  const resumenMap: Record<Category, { es: string; en: string }> = {
    error: {
      es: 'Ingresá un valor mayor a 0 para ver la interpretación.',
      en: 'Enter a value greater than 0 to see the interpretation.',
    },
    hipoglucemia: {
      es: `Tu valor de ${mgdlStr} mg/dL (${mmolStr} mmol/L) está por debajo de 70 mg/dL, lo que define hipoglucemia. Esto puede deberse a ayuno prolongado, actividad física intensa, medicación hipoglucemiante o insulina. Si tenés síntomas (temblores, sudoración, mareos), consumí 15 g de glucosa de acción rápida y consultá con tu médico. Un único valor bajo sin síntomas también debe comentarse en la próxima consulta.`,
      en: `Your value of ${mgdlStr} mg/dL (${mmolStr} mmol/L) is below 70 mg/dL, which defines hypoglycemia. This may result from prolonged fasting, intense exercise, hypoglycemic medication, or insulin. If you have symptoms (trembling, sweating, dizziness), consume 15 g of fast-acting glucose and contact your doctor. Even an isolated low value without symptoms should be discussed at your next appointment.`,
    },
    normal: {
      es: `Tu valor de ${mgdlStr} mg/dL (${mmolStr} mmol/L) es <strong>normal</strong> según los criterios OMS/ADA 2026. El rango normal en ayunas es 70–99 mg/dL. Esto indica que tu metabolismo basal de glucosa está regulado adecuadamente. Si sos adulto sano sin factores de riesgo, las guías recomiendan repetir el análisis cada 3 años a partir de los 45 años.`,
      en: `Your value of ${mgdlStr} mg/dL (${mmolStr} mmol/L) is <strong>normal</strong> per 2026 WHO/ADA criteria. The normal fasting range is 70–99 mg/dL. This indicates your baseline glucose metabolism is well-regulated. If you are a healthy adult with no risk factors, guidelines recommend re-testing every 3 years from age 45.`,
    },
    prediabetes: {
      es: `Tu valor de ${mgdlStr} mg/dL (${mmolStr} mmol/L) cae en el rango de <strong>prediabetes</strong> (glucemia en ayunas alterada: 100–125 mg/dL). No es diabetes, pero indica que los mecanismos de regulación de glucosa están perdiendo eficiencia. Sin intervención, el 15–30% de las personas en este rango progresa a diabetes tipo 2 en 5 años. La buena noticia: perder el 5–7% del peso corporal y hacer 150 minutos semanales de actividad física moderada reduce ese riesgo un 58% (estudio DPP, NEJM 2002). Consultá con tu médico para definir un plan de seguimiento.`,
      en: `Your value of ${mgdlStr} mg/dL (${mmolStr} mmol/L) falls in the <strong>prediabetes</strong> range (Impaired Fasting Glucose: 100–125 mg/dL). This is not diabetes, but signals that glucose regulation is becoming less efficient. Without intervention, 15–30% of people in this range progress to type 2 diabetes within 5 years. The good news: losing 5–7% of body weight and getting 150 minutes/week of moderate physical activity reduces that risk by 58% (DPP study, NEJM 2002). Consult your doctor for a monitoring plan.`,
    },
    diabetes_alto: {
      es: `Tu valor de ${mgdlStr} mg/dL (${mmolStr} mmol/L) supera el umbral diagnóstico de <strong>diabetes mellitus (≥ 126 mg/dL)</strong> según ADA 2026 y OMS. Importante: un único valor elevado generalmente requiere <strong>confirmación en una segunda muestra en día distinto</strong> para establecer el diagnóstico, salvo que haya síntomas clásicos (mucha sed, mucha orina, pérdida de peso inexplicada). Consultá con tu médico a la brevedad para confirmar y, si corresponde, iniciar el seguimiento y tratamiento adecuado.`,
      en: `Your value of ${mgdlStr} mg/dL (${mmolStr} mmol/L) exceeds the <strong>diabetes mellitus diagnostic threshold (≥ 126 mg/dL)</strong> per ADA 2026 and WHO criteria. Important: a single elevated value typically requires <strong>confirmation on a separate day</strong> to establish diagnosis, unless classic symptoms are present (excessive thirst, frequent urination, unexplained weight loss). Please consult your doctor promptly to confirm and, if appropriate, begin proper monitoring and treatment.`,
    },
  };

  const toneMap: Record<Category, string> = {
    error: 'neutral',
    hipoglucemia: 'warning',
    normal: 'positive',
    prediabetes: 'warning',
    diabetes_alto: 'alert',
  };

  const resultado = __lang === 'en' ? labels[category].en : labels[category].es;
  const resumen = __lang === 'en' ? resumenMap[category].en : resumenMap[category].es;

  const insightTitleMap = {
    error: { es: 'Sin resultado', en: 'No result' },
    hipoglucemia: { es: 'Hipoglucemia detectada', en: 'Hypoglycemia detected' },
    normal: { es: 'Glucemia normal', en: 'Normal blood glucose' },
    prediabetes: { es: 'Prediabetes (glucemia alterada)', en: 'Prediabetes (impaired fasting glucose)' },
    diabetes_alto: { es: 'Umbral de diabetes', en: 'Diabetes threshold' },
  };

  const _insight = {
    title: __lang === 'en' ? insightTitleMap[category].en : insightTitleMap[category].es,
    text: __lang === 'en' ? resumenMap[category].en : resumenMap[category].es,
    tone: toneMap[category],
    icon: '🩸',
  };

  return { resultado, resumen, _insight };
}
