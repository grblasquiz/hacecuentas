export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/*
 * Waist circumference cardiovascular & metabolic risk classification.
 *
 * References:
 *   - WHO Technical Report 894 (2000): European cut-offs 94/102 cm (men), 80/88 cm (women)
 *   - IDF Metabolic Syndrome Consensus (2006): Latin-American men ≥90 cm, women ≥80 cm
 *   - Alberti et al. Circulation 2009 (harmonised AHA/NHLBI + IDF joint statement)
 *
 * Logic:
 *   1. Read waist measurement (cm) and sex (M / F).
 *   2. Apply WHO thresholds for European/global reference AND IDF thresholds
 *      for Latin-American populations.
 *   3. Return risk level, label, and contextual advice.
 */

export function perimetroAbdominalRiesgoCardiovascular(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const cintura = Number(i.cintura) || 0;
  const sexo = String(i.sexo || '').toUpperCase(); // 'M' or 'F'

  // ── WHO European thresholds ──────────────────────────────────────────────
  // Men:   normal < 94 cm | increased ≥94 cm | substantially elevated ≥102 cm
  // Women: normal < 80 cm | increased ≥80 cm | substantially elevated ≥88 cm
  const whoThresholds = sexo === 'M'
    ? { increased: 94, high: 102 }
    : { increased: 80, high: 88 };

  // ── IDF Latin-American thresholds (used for LatAm/South Asian origin) ───
  // Men: ≥90 cm | Women: ≥80 cm  (single-tier — any excess = metabolic risk)
  const idfThreshold = sexo === 'M' ? 90 : 80;

  // Determine WHO risk level
  let whoRiskLevel: 'normal' | 'increased' | 'high';
  if (cintura < whoThresholds.increased) {
    whoRiskLevel = 'normal';
  } else if (cintura < whoThresholds.high) {
    whoRiskLevel = 'increased';
  } else {
    whoRiskLevel = 'high';
  }

  // Determine IDF risk for Latin America
  const idfRisk = cintura >= idfThreshold;

  // ── Labels ────────────────────────────────────────────────────────────────
  const labels = {
    es: {
      normal: 'Sin riesgo aumentado',
      increased: 'Riesgo aumentado',
      high: 'Riesgo sustancialmente elevado',
      whoLabel: 'Clasificación OMS (global)',
      idfLabel: 'Referencia IDF (Latinoamérica)',
      idfAtRisk: 'Riesgo metabólico presente',
      idfNoRisk: 'Sin riesgo IDF adicional',
    },
    en: {
      normal: 'No increased risk',
      increased: 'Increased risk',
      high: 'Substantially elevated risk',
      whoLabel: 'WHO classification (global)',
      idfLabel: 'IDF reference (Latin America)',
      idfAtRisk: 'Metabolic risk present',
      idfNoRisk: 'No IDF additional risk',
    },
  };
  const lbl = labels[__lang];

  const whoLabel = lbl[whoRiskLevel];
  const idfLabel = idfRisk ? lbl.idfAtRisk : lbl.idfNoRisk;

  // ── Output: resultado (primary classification) ───────────────────────────
  const resultado = `${lbl.whoLabel}: ${whoLabel}`;

  // ── Output: resumen (full interpretation) ────────────────────────────────
  let resumen: string;
  if (__lang === 'en') {
    if (sexo === 'M') {
      if (whoRiskLevel === 'normal') {
        resumen = `Your waist of **${cintura} cm** is below the WHO threshold of 94 cm for men — no increased cardiovascular risk from waist circumference alone. For Latin American men the IDF threshold is 90 cm; your result is ${idfRisk ? 'above it (IDF: metabolic risk)' : 'below it (IDF: no risk)'}. Maintain a healthy diet, regular physical activity and periodic check-ups.`;
      } else if (whoRiskLevel === 'increased') {
        resumen = `Your waist of **${cintura} cm** exceeds the WHO threshold of 94 cm for men — **increased cardiovascular and metabolic risk**. Threshold for substantially elevated risk is 102 cm. For Latin American men the IDF cut-off is 90 cm. A 5–10% reduction in body weight typically reduces waist circumference by 3–5 cm. Consult your doctor for a full metabolic assessment (blood glucose, lipids, blood pressure).`;
      } else {
        resumen = `Your waist of **${cintura} cm** exceeds 102 cm — **substantially elevated cardiovascular and metabolic risk** according to WHO. This level is strongly associated with metabolic syndrome, type 2 diabetes and coronary artery disease. Seek medical evaluation promptly.`;
      }
    } else {
      if (whoRiskLevel === 'normal') {
        resumen = `Your waist of **${cintura} cm** is below the WHO threshold of 80 cm for women — no increased cardiovascular risk from waist circumference alone. For Latin American women the IDF threshold is also 80 cm; your result is ${idfRisk ? 'at or above it (IDF: metabolic risk)' : 'below it (IDF: no risk)'}. Maintain a healthy lifestyle and annual check-ups.`;
      } else if (whoRiskLevel === 'increased') {
        resumen = `Your waist of **${cintura} cm** exceeds the WHO threshold of 80 cm for women — **increased cardiovascular and metabolic risk**. Threshold for substantially elevated risk is 88 cm. Lifestyle changes (aerobic exercise ≥150 min/week, reduced refined carbohydrates) are recommended. Consult your doctor for a full assessment.`;
      } else {
        resumen = `Your waist of **${cintura} cm** exceeds 88 cm — **substantially elevated cardiovascular and metabolic risk** according to WHO. This level is strongly associated with metabolic syndrome, type 2 diabetes and cardiovascular disease. Seek medical evaluation promptly.`;
      }
    }
  } else {
    // Spanish
    if (sexo === 'M') {
      if (whoRiskLevel === 'normal') {
        resumen = `Tu perímetro abdominal de **${cintura} cm** está por debajo del umbral OMS de 94 cm para hombres — sin riesgo cardiovascular aumentado por circunferencia de cintura. Para hombres latinoamericanos el umbral IDF es 90 cm; tu resultado está ${idfRisk ? 'por encima (IDF: riesgo metabólico presente)' : 'por debajo (IDF: sin riesgo adicional)'}. Mantené una alimentación equilibrada, actividad física regular y controles periódicos.`;
      } else if (whoRiskLevel === 'increased') {
        resumen = `Tu perímetro abdominal de **${cintura} cm** supera el umbral OMS de 94 cm para hombres — **riesgo cardiovascular y metabólico aumentado**. El umbral de riesgo sustancialmente elevado es 102 cm. Para hombres latinoamericanos el corte IDF es 90 cm. Una reducción del 5–10% del peso corporal suele reducir la cintura 3–5 cm. Consultá a tu médico para evaluación completa (glucemia, lípidos, presión arterial).`;
      } else {
        resumen = `Tu perímetro abdominal de **${cintura} cm** supera los 102 cm — **riesgo cardiovascular y metabólico sustancialmente elevado** según la OMS. Este nivel está fuertemente asociado a síndrome metabólico, diabetes tipo 2 y enfermedad coronaria. Consultá a un médico a la brevedad.`;
      }
    } else {
      if (whoRiskLevel === 'normal') {
        resumen = `Tu perímetro abdominal de **${cintura} cm** está por debajo del umbral OMS de 80 cm para mujeres — sin riesgo cardiovascular aumentado por circunferencia de cintura. El umbral IDF para mujeres latinoamericanas es también 80 cm; tu resultado está ${idfRisk ? 'en el límite o por encima (IDF: riesgo metabólico presente)' : 'por debajo (IDF: sin riesgo adicional)'}. Mantené un estilo de vida saludable y controles anuales.`;
      } else if (whoRiskLevel === 'increased') {
        resumen = `Tu perímetro abdominal de **${cintura} cm** supera el umbral OMS de 80 cm para mujeres — **riesgo cardiovascular y metabólico aumentado**. El umbral de riesgo sustancialmente elevado es 88 cm. Se recomiendan cambios en el estilo de vida (ejercicio aeróbico ≥150 min/semana, reducción de carbohidratos refinados). Consultá a tu médico para una evaluación integral.`;
      } else {
        resumen = `Tu perímetro abdominal de **${cintura} cm** supera los 88 cm — **riesgo cardiovascular y metabólico sustancialmente elevado** según la OMS. Este nivel está fuertemente asociado a síndrome metabólico, diabetes tipo 2 y enfermedad cardiovascular. Consultá a un médico a la brevedad.`;
      }
    }
  }

  // ── Insight ───────────────────────────────────────────────────────────────
  const insightTone =
    whoRiskLevel === 'normal' ? 'positive' :
    whoRiskLevel === 'increased' ? 'warning' : 'alert';

  const insightIcon = whoRiskLevel === 'normal' ? '✅' : whoRiskLevel === 'increased' ? '⚠️' : '🚨';

  const insightTitle = __lang === 'en'
    ? 'Reading your result'
    : 'Cómo leer tu resultado';

  const referenceTable = __lang === 'en'
    ? `**WHO cut-offs:** Men — normal <94 cm | increased ≥94 cm | substantially elevated ≥102 cm. Women — normal <80 cm | increased ≥80 cm | substantially elevated ≥88 cm. **IDF (Latin American origin):** Men ≥90 cm | Women ≥80 cm = metabolic risk.`
    : `**Umbrales OMS:** Hombres — normal <94 cm | aumentado ≥94 cm | sustancialmente elevado ≥102 cm. Mujeres — normal <80 cm | aumentado ≥80 cm | sustancialmente elevado ≥88 cm. **IDF (latinoamericanos):** Hombres ≥90 cm | Mujeres ≥80 cm = riesgo metabólico.`;

  return {
    resultado,
    resumen,
    _insight: {
      title: insightTitle,
      text: referenceTable,
      tone: insightTone,
      icon: insightIcon,
    },
  };
}
