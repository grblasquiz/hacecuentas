export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Blood pressure classification based on the 2025 AHA/ACC Hypertension Guideline
 * (maintains the same category thresholds as the 2017 guideline).
 *
 * Source: 2025 AHA/ACC Guideline for the Prevention, Detection, Evaluation and
 * Management of High Blood Pressure in Adults. Hypertension (AHA Journals).
 * https://www.ahajournals.org/doi/10.1161/HYP.0000000000000249
 *
 * Categories:
 *   Normal:              SBP <120  AND DBP <80
 *   Elevated:            SBP 120–129 AND DBP <80
 *   Stage 1 HTN:         SBP 130–139 OR  DBP 80–89
 *   Stage 2 HTN:         SBP ≥140   OR  DBP ≥90
 *   Hypertensive Crisis: SBP >180   OR  DBP >120
 */
export function presionArterialTablaNormalHipertension(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const sbp = Number(i.sistolica);
  const dbp = Number(i.diastolica);

  // Validate inputs
  if (!Number.isFinite(sbp) || sbp <= 0 || !Number.isFinite(dbp) || dbp <= 0) {
    const errorMsg = __lang === 'en'
      ? 'Enter valid systolic and diastolic values in mmHg.'
      : 'Ingresá valores válidos de presión sistólica y diastólica en mmHg.';
    return { resultado: '', resumen: errorMsg, _insight: { title: '', text: errorMsg, tone: 'neutral', icon: '🫀' } };
  }

  // Classify using whichever reading is higher (AHA rule: category is determined by the higher value)
  let categoria: string;
  let categoriaEs: string;
  let tone: 'positive' | 'neutral' | 'warning' | 'danger';
  let recomendacion: string;
  let recomendacionEn: string;
  let colorHex: string;

  if (sbp > 180 || dbp > 120) {
    categoriaEs = 'Crisis hipertensiva';
    categoria = 'Hypertensive Crisis';
    tone = 'danger';
    colorHex = '#c0392b';
    recomendacion = 'Valores críticos. Consultá atención médica de urgencia de inmediato si se confirman en dos mediciones separadas.';
    recomendacionEn = 'Critical values. Seek emergency medical attention immediately if confirmed in two separate readings.';
  } else if (sbp >= 140 || dbp >= 90) {
    categoriaEs = 'Hipertensión Estadio 2';
    categoria = 'Stage 2 Hypertension';
    tone = 'danger';
    colorHex = '#e74c3c';
    recomendacion = 'Valores elevados. Se recomienda evaluación médica para ajuste de tratamiento o inicio de medicación.';
    recomendacionEn = 'High values. Medical evaluation recommended for treatment adjustment or initiation of medication.';
  } else if (sbp >= 130 || dbp >= 80) {
    categoriaEs = 'Hipertensión Estadio 1';
    categoria = 'Stage 1 Hypertension';
    tone = 'warning';
    colorHex = '#f39c12';
    recomendacion = 'Consulta con tu médico. Se recomiendan cambios en estilo de vida y posiblemente medicación según riesgo cardiovascular.';
    recomendacionEn = 'Consult your doctor. Lifestyle changes and possibly medication are recommended based on cardiovascular risk.';
  } else if (sbp >= 120 && dbp < 80) {
    categoriaEs = 'Presión elevada';
    categoria = 'Elevated Blood Pressure';
    tone = 'warning';
    colorHex = '#e67e22';
    recomendacion = 'Sin hipertensión aún, pero en zona de riesgo. Cambios en estilo de vida para prevenir progresión.';
    recomendacionEn = 'Not hypertension yet, but in the at-risk zone. Lifestyle changes recommended to prevent progression.';
  } else {
    categoriaEs = 'Normal';
    categoria = 'Normal';
    tone = 'positive';
    colorHex = '#27ae60';
    recomendacion = 'Valores dentro del rango normal. Mantener hábitos saludables y controles periódicos.';
    recomendacionEn = 'Values within normal range. Maintain healthy habits and regular check-ups.';
  }

  const resultado = __lang === 'en' ? categoria : categoriaEs;
  const rec = __lang === 'en' ? recomendacionEn : recomendacion;

  const resumen = __lang === 'en'
    ? `${sbp}/${dbp} mmHg → ${categoria}. ${recomendacionEn}`
    : `${sbp}/${dbp} mmHg → ${categoriaEs}. ${recomendacion}`;

  // Build classification table for insight
  const tableEs = `
| Categoría | Sistólica (mmHg) | | Diastólica (mmHg) |
|---|---|---|---|
| Normal | < 120 | Y | < 80 |
| Presión elevada | 120–129 | Y | < 80 |
| Hipertensión Estadio 1 | 130–139 | O | 80–89 |
| Hipertensión Estadio 2 | ≥ 140 | O | ≥ 90 |
| Crisis hipertensiva | > 180 | O | > 120 |
`.trim();

  const tableEn = `
| Category | Systolic (mmHg) | | Diastolic (mmHg) |
|---|---|---|---|
| Normal | < 120 | AND | < 80 |
| Elevated | 120–129 | AND | < 80 |
| Stage 1 Hypertension | 130–139 | OR | 80–89 |
| Stage 2 Hypertension | ≥ 140 | OR | ≥ 90 |
| Hypertensive Crisis | > 180 | OR | > 120 |
`.trim();

  const _insight = __lang === 'en'
    ? {
        title: categoria,
        text: `**${sbp}/${dbp} mmHg** classifies as **${categoria}**.\n\n${recomendacionEn}\n\n${tableEn}`,
        tone,
        icon: '🫀',
      }
    : {
        title: categoriaEs,
        text: `**${sbp}/${dbp} mmHg** clasifica como **${categoriaEs}**.\n\n${recomendacion}\n\n${tableEs}`,
        tone,
        icon: '🫀',
      };

  return { resultado, resumen, _insight };
}
