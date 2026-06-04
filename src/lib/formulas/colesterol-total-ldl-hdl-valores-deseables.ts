export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Clinical thresholds per ACC/AHA 2018 Cholesterol Guideline (Grundy et al., Circulation 2019)
// and NCEP ATP III / Sociedad Argentina de Cardiología (SAC).

function classifyTotal(mg: number, lang: 'es' | 'en'): { cat: string; level: number } {
  if (mg < 200) return { cat: lang === 'en' ? 'Desirable (<200)' : 'Deseable (<200)', level: 0 };
  if (mg < 240) return { cat: lang === 'en' ? 'Borderline-high (200–239)' : 'Limítrofe-alto (200–239)', level: 1 };
  return { cat: lang === 'en' ? 'High (≥240)' : 'Alto (≥240)', level: 2 };
}

function classifyLDL(mg: number, lang: 'es' | 'en'): { cat: string; level: number } {
  if (mg < 100) return { cat: lang === 'en' ? 'Optimal (<100)' : 'Óptimo (<100)', level: 0 };
  if (mg < 130) return { cat: lang === 'en' ? 'Near-optimal (100–129)' : 'Casi óptimo (100–129)', level: 1 };
  if (mg < 160) return { cat: lang === 'en' ? 'Borderline-high (130–159)' : 'Limítrofe-alto (130–159)', level: 2 };
  if (mg < 190) return { cat: lang === 'en' ? 'High (160–189)' : 'Alto (160–189)', level: 3 };
  return { cat: lang === 'en' ? 'Very high (≥190) — statin mandatory' : 'Muy alto (≥190) — estatina indicada', level: 4 };
}

function classifyHDL(mg: number, sex: 'male' | 'female', lang: 'es' | 'en'): { cat: string; level: number } {
  const threshold = sex === 'female' ? 50 : 40;
  if (mg >= 60) return { cat: lang === 'en' ? 'Protective (≥60)' : 'Protector (≥60)', level: 0 };
  if (mg >= threshold) return { cat: lang === 'en' ? `Acceptable (≥${threshold})` : `Aceptable (≥${threshold})`, level: 1 };
  return { cat: lang === 'en' ? `Risk factor (<${threshold})` : `Factor de riesgo (<${threshold})`, level: 2 };
}

function classifyTrig(mg: number, lang: 'es' | 'en'): { cat: string; level: number } {
  if (mg < 150) return { cat: lang === 'en' ? 'Normal (<150)' : 'Normal (<150)', level: 0 };
  if (mg < 200) return { cat: lang === 'en' ? 'Borderline (150–199)' : 'Limítrofe (150–199)', level: 1 };
  if (mg < 500) return { cat: lang === 'en' ? 'High (200–499)' : 'Alto (200–499)', level: 2 };
  return { cat: lang === 'en' ? 'Very high ≥500 — pancreatitis risk' : 'Muy alto ≥500 — riesgo pancreatitis', level: 3 };
}

export function colesterolTotalLdlHdlValoresDeseables(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const totalChol = Number(i.colesterol_total) || 0;
  const ldl       = Number(i.ldl)              || 0;
  const hdl       = Number(i.hdl)              || 0;
  const trig      = Number(i.trigliceridos)    || 0;
  const sexRaw    = String(i.sexo || '').toLowerCase();
  const sex: 'male' | 'female' = sexRaw === 'female' || sexRaw === 'femenino' ? 'female' : 'male';

  // --- Friedewald LDL (if user left LDL blank but has trig) ---
  let ldlCalc = ldl;
  let ldlIsEstimated = false;
  if (ldl <= 0 && totalChol > 0 && hdl > 0 && trig > 0 && trig < 400) {
    ldlCalc = totalChol - hdl - trig / 5;
    ldlIsEstimated = true;
  }

  // --- Non-HDL ---
  const nonHdl = totalChol > 0 && hdl > 0 ? totalChol - hdl : 0;

  // --- Classifications ---
  const totalClass = totalChol > 0 ? classifyTotal(totalChol, __lang) : null;
  const ldlClass   = ldlCalc  > 0 ? classifyLDL(ldlCalc, __lang)     : null;
  const hdlClass   = hdl      > 0 ? classifyHDL(hdl, sex, __lang)    : null;
  const trigClass  = trig     > 0 ? classifyTrig(trig, __lang)        : null;

  // --- Build primary resultado string ---
  const lines: string[] = [];
  if (totalClass) {
    lines.push(__lang === 'en'
      ? `Total: ${totalChol} mg/dL — ${totalClass.cat}`
      : `Total: ${totalChol} mg/dL — ${totalClass.cat}`);
  }
  if (ldlClass) {
    const prefix = ldlIsEstimated
      ? (__lang === 'en' ? 'LDL (Friedewald est.)' : 'LDL (est. Friedewald)')
      : 'LDL';
    lines.push(`${prefix}: ${ldlCalc.toFixed(0)} mg/dL — ${ldlClass.cat}`);
  }
  if (hdlClass) {
    lines.push(`HDL: ${hdl} mg/dL — ${hdlClass.cat}`);
  }
  if (nonHdl > 0) {
    const nonHdlStatus = nonHdl < 130
      ? (__lang === 'en' ? 'Optimal (<130)' : 'Óptimo (<130)')
      : nonHdl < 160
        ? (__lang === 'en' ? 'Above goal (130–159)' : 'Encima del objetivo (130–159)')
        : (__lang === 'en' ? 'High (≥160)' : 'Alto (≥160)');
    lines.push(__lang === 'en'
      ? `Non-HDL: ${nonHdl.toFixed(0)} mg/dL — ${nonHdlStatus}`
      : `No-HDL: ${nonHdl.toFixed(0)} mg/dL — ${nonHdlStatus}`);
  }
  if (trigClass) {
    lines.push(`Triglicéridos / Triglycerides: ${trig} mg/dL — ${trigClass.cat}`);
  }

  const resultado = lines.length > 0 ? lines.join('\n') : (
    __lang === 'en' ? 'Enter at least Total Cholesterol and HDL to see results.' : 'Ingresá al menos Colesterol Total y HDL para ver resultados.'
  );

  // --- Build resumen ---
  const worstLevel = Math.max(
    totalClass?.level ?? 0,
    ldlClass?.level   ?? 0,
    hdlClass?.level   ?? 0,
    trigClass?.level  ?? 0,
  );

  let overallMsg: string;
  if (worstLevel === 0) {
    overallMsg = __lang === 'en'
      ? 'All values in optimal range. Maintain healthy habits and schedule routine follow-up.'
      : 'Todos los valores en rango óptimo. Mantené los hábitos saludables y consultá al médico de rutina.';
  } else if (worstLevel === 1) {
    overallMsg = __lang === 'en'
      ? 'Some values are borderline. Lifestyle changes (diet, exercise) are the first step — discuss with your physician.'
      : 'Algunos valores están en zona limítrofe. Los cambios de estilo de vida (dieta, ejercicio) son el primer paso: consultá con tu médico.';
  } else if (worstLevel === 2) {
    overallMsg = __lang === 'en'
      ? 'One or more values are elevated. Medical evaluation and lifestyle intervention are strongly advised.'
      : 'Uno o más valores están elevados. Se recomienda evaluación médica e intervención en el estilo de vida.';
  } else if (worstLevel === 3) {
    overallMsg = __lang === 'en'
      ? 'High lipid values detected. Statin therapy is typically indicated — consult your physician promptly.'
      : 'Valores lipídicos altos detectados. El tratamiento con estatinas suele estar indicado: consultá a tu médico pronto.';
  } else {
    overallMsg = __lang === 'en'
      ? 'LDL ≥190 mg/dL: statin therapy is mandatory per ACC/AHA 2018 regardless of 10-year risk. Seek medical attention.'
      : 'LDL ≥190 mg/dL: el tratamiento con estatinas está indicado según las guías AHA 2018 independientemente del riesgo a 10 años. Consultá a tu médico.';
  }

  // Add note if LDL was estimated
  const ldlNote = ldlIsEstimated
    ? (__lang === 'en'
        ? ' (LDL estimated via Friedewald; only valid for triglycerides <400 mg/dL)'
        : ' (LDL estimado por Friedewald; válido sólo con triglicéridos <400 mg/dL)')
    : '';

  const resumen = overallMsg + ldlNote + (__lang === 'en'
    ? ' — Educational tool only. Not a substitute for a complete clinical evaluation.'
    : ' — Resultado orientativo. No reemplaza la evaluación médica completa.');

  // --- Insight ---
  const insightTone = worstLevel >= 3 ? 'alert' : worstLevel >= 1 ? 'warning' : 'positive';

  const insightText = __lang === 'en'
    ? `**Summary:** ${overallMsg.replace(/\s*—.*$/, '')}${ldlNote}` +
      (ldlCalc > 0 ? ` LDL ${ldlCalc.toFixed(0)} mg/dL` + (ldlClass ? ` → **${ldlClass.cat}**.` : '.') : '') +
      (hdl > 0 && hdlClass ? ` HDL ${hdl} mg/dL → **${hdlClass.cat}**.` : '') +
      (nonHdl > 0 ? ` Non-HDL: ${nonHdl.toFixed(0)} mg/dL (target <130).` : '') +
      ` Reference: ACC/AHA 2018 Cholesterol Guideline.`
    : `**Resumen:** ${overallMsg.replace(/\s*—.*$/, '')}${ldlNote}` +
      (ldlCalc > 0 ? ` LDL ${ldlCalc.toFixed(0)} mg/dL` + (ldlClass ? ` → **${ldlClass.cat}**.` : '.') : '') +
      (hdl > 0 && hdlClass ? ` HDL ${hdl} mg/dL → **${hdlClass.cat}**.` : '') +
      (nonHdl > 0 ? ` No-HDL: ${nonHdl.toFixed(0)} mg/dL (objetivo <130).` : '') +
      ` Fuente: guías AHA 2018 / SAC.`;

  const _insight = {
    title: __lang === 'en' ? 'Lipid Panel Interpretation' : 'Interpretación del perfil lipídico',
    text: insightText,
    tone: insightTone,
    icon: '🩸',
  };

  return { resultado, resumen, _insight };
}
