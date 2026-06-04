export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Triglyceride classification based on NCEP ATP III / AHA guidelines.
 *
 * Classification thresholds (fasting, adults):
 *   Normal       : < 150 mg/dL  (< 1.70 mmol/L)
 *   Borderline   : 150–199 mg/dL (1.70–2.25 mmol/L)
 *   High         : 200–499 mg/dL (2.26–5.64 mmol/L)
 *   Very High    : ≥ 500 mg/dL  (≥ 5.65 mmol/L)
 *
 * Sources:
 *   - NCEP ATP III (NHLBI, 2001/2004)
 *   - American Heart Association — Triglycerides
 *   - NIH MedlinePlus — Triglyceride level
 *
 * Inputs:
 *   trigliceridos  — numeric lab value
 *   unidad         — "mgdl" | "mmoll"
 */
export function trigliceridosValoresNormalesRiesgo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const raw = Number(i.trigliceridos) || 0;
  const unidad = String(i.unidad || 'mgdl');

  // Convert everything to mg/dL for classification
  const CONV = 0.01129; // 1 mg/dL = 0.01129 mmol/L
  const mgdl = unidad === 'mmoll' ? raw / CONV : raw;
  const mmoll = unidad === 'mmoll' ? raw : raw * CONV;

  // Compute the "other unit" display value
  const mgdlStr = mgdl.toFixed(1);
  const mmollStr = mmoll.toFixed(2);

  // NCEP ATP III / AHA classification thresholds
  type Category = 'normal' | 'borderline' | 'high' | 'very_high' | 'invalid';

  let cat: Category = 'normal';
  if (raw <= 0) {
    cat = 'invalid';
  } else if (mgdl < 150) {
    cat = 'normal';
  } else if (mgdl < 200) {
    cat = 'borderline';
  } else if (mgdl < 500) {
    cat = 'high';
  } else {
    cat = 'very_high';
  }

  // Labels per category and language
  const labels: Record<Category, { es: string; en: string }> = {
    normal:    { es: 'Normal',       en: 'Normal' },
    borderline:{ es: 'Límite alto',  en: 'Borderline High' },
    high:      { es: 'Alto',         en: 'High' },
    very_high: { es: 'Muy alto',     en: 'Very High' },
    invalid:   { es: '—',            en: '—' },
  };

  const resultado = labels[cat][__lang];

  // Risk level for insight tone
  const toneMap: Record<Category, 'positive' | 'warning' | 'alert' | 'neutral'> = {
    normal:    'positive',
    borderline:'warning',
    high:      'alert',
    very_high: 'alert',
    invalid:   'neutral',
  };

  // Resumen / interpretation
  const resumenMap: Record<Category, { es: string; en: string }> = {
    normal: {
      es: `Tu valor de **${mgdlStr} mg/dL** (${mmollStr} mmol/L) está en rango **normal** (< 150 mg/dL). Seguí con tus controles de rutina y mantenés buenos hábitos.`,
      en: `Your value of **${mgdlStr} mg/dL** (${mmollStr} mmol/L) falls in the **normal** range (< 150 mg/dL). Keep up healthy habits and routine check-ups.`,
    },
    borderline: {
      es: `Tu valor de **${mgdlStr} mg/dL** (${mmollStr} mmol/L) está en rango **límite alto** (150–199 mg/dL). Es una señal para revisar la alimentación (menos azúcares, alcohol y harinas refinadas) y aumentar la actividad física. Comentáselo a tu médico.`,
      en: `Your value of **${mgdlStr} mg/dL** (${mmollStr} mmol/L) is in the **borderline high** range (150–199 mg/dL). Consider cutting back on sugar, refined carbs and alcohol, and increasing physical activity. Discuss with your doctor.`,
    },
    high: {
      es: `Tu valor de **${mgdlStr} mg/dL** (${mmollStr} mmol/L) está en rango **alto** (200–499 mg/dL). Se asocia con mayor riesgo cardiovascular. Consultá con tu médico para una evaluación completa del perfil lipídico.`,
      en: `Your value of **${mgdlStr} mg/dL** (${mmollStr} mmol/L) is in the **high** range (200–499 mg/dL). This is associated with elevated cardiovascular risk. Consult your doctor for a full lipid panel evaluation.`,
    },
    very_high: {
      es: `Tu valor de **${mgdlStr} mg/dL** (${mmollStr} mmol/L) está en rango **muy alto** (≥ 500 mg/dL). Existe riesgo significativo de **pancreatitis aguda**. Consultá con un médico de urgencia o de inmediato con tu médico tratante.`,
      en: `Your value of **${mgdlStr} mg/dL** (${mmollStr} mmol/L) is in the **very high** range (≥ 500 mg/dL). There is significant risk of **acute pancreatitis**. Seek urgent medical attention.`,
    },
    invalid: {
      es: 'Ingresá un valor válido mayor a 0.',
      en: 'Please enter a valid value greater than 0.',
    },
  };

  const resumen = resumenMap[cat][__lang];

  // Insight block
  const insightTitleMap = { es: 'Clasificación NCEP ATP III / AHA', en: 'NCEP ATP III / AHA Classification' };
  const insightTextMap = {
    es: `Tu valor es **${resultado}** (${mgdlStr} mg/dL = ${mmollStr} mmol/L).\n\n**Rangos de referencia (adultos en ayunas):**\n- Normal: < 150 mg/dL (< 1,70 mmol/L)\n- Límite alto: 150–199 mg/dL (1,70–2,25 mmol/L)\n- Alto: 200–499 mg/dL (2,26–5,64 mmol/L)\n- Muy alto: ≥ 500 mg/dL (≥ 5,65 mmol/L)\n\n*Fuente: NCEP ATP III / American Heart Association*`,
    en: `Your value is **${resultado}** (${mgdlStr} mg/dL = ${mmollStr} mmol/L).\n\n**Reference ranges (fasting adults):**\n- Normal: < 150 mg/dL (< 1.70 mmol/L)\n- Borderline high: 150–199 mg/dL (1.70–2.25 mmol/L)\n- High: 200–499 mg/dL (2.26–5.64 mmol/L)\n- Very high: ≥ 500 mg/dL (≥ 5.65 mmol/L)\n\n*Source: NCEP ATP III / American Heart Association*`,
  };

  const _insight = {
    title: insightTitleMap[__lang],
    text: insightTextMap[__lang],
    tone: toneMap[cat],
    icon: '🩸',
  };

  return { resultado, resumen, _insight };
}
