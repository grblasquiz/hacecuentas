export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

/**
 * Weighted grade average by credit hours.
 * v1 = comma/semicolon-separated grade points (e.g. "3.7, 4.0, 2.3")
 * v2 = comma/semicolon-separated credit hours  (e.g. "3, 4, 3")
 *
 * Formula: Σ(grade_i × credits_i) / Σ(credits_i)
 * Source: Rutgers SOE GPA guide; University of Illinois Registrar
 */
export function promedioPonderadoMateriasCreditosUniversidad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = {
    errGrades: __lang === 'en' ? 'Enter at least one grade' : 'Ingresá al menos una nota',
    errCredits: __lang === 'en' ? 'Enter credit hours for each course' : 'Ingresá los créditos de cada materia',
    errMismatch: (a: number, b: number) =>
      __lang === 'en'
        ? `Number of grades (${a}) must match number of credit hours (${b})`
        : `La cantidad de notas (${a}) y de créditos (${b}) debe ser igual`,
    errGradeRange: (g: number) =>
      __lang === 'en'
        ? `Grade ${g} is out of the expected range (0–4.0 or 0–10)`
        : `La nota ${g} está fuera del rango esperado`,
    errCreditsPos: (c: number) =>
      __lang === 'en'
        ? `Credit hours must be positive, got ${c}`
        : `Los créditos deben ser positivos, se obtuvo ${c}`,
    insTitle: __lang === 'en' ? 'Your weighted average' : 'Tu promedio ponderado',
  };

  // --- Parse v1 (grades) ---
  const gradesRaw = String(i.v1 || '').trim();
  if (!gradesRaw) throw new Error(T.errGrades);

  const grades = gradesRaw
    .split(/[,;\s]+/)
    .filter(s => s.length > 0)
    .map(s => parseFloat(s.replace(',', '.')));

  if (grades.length === 0 || grades.some(isNaN)) throw new Error(T.errGrades);

  // --- Parse v2 (credits) ---
  const creditsRaw = String(i.v2 || '').trim();
  if (!creditsRaw) throw new Error(T.errCredits);

  const credits = creditsRaw
    .split(/[,;\s]+/)
    .filter(s => s.length > 0)
    .map(s => parseFloat(s.replace(',', '.')));

  if (credits.length === 0 || credits.some(isNaN)) throw new Error(T.errCredits);

  // --- Validate lengths match ---
  if (grades.length !== credits.length) throw new Error(T.errMismatch(grades.length, credits.length));

  // --- Validate ranges ---
  for (const g of grades) {
    if (g < 0 || g > 10) throw new Error(T.errGradeRange(g));
  }
  for (const c of credits) {
    if (c <= 0) throw new Error(T.errCreditsPos(c));
  }

  // --- Core calculation: Σ(grade × credits) / Σ(credits) ---
  const totalCredits = credits.reduce((acc, c) => acc + c, 0);
  const sumWeighted = grades.reduce((acc, g, idx) => acc + g * credits[idx], 0);
  const weighted = sumWeighted / totalCredits;
  const simpleAvg = grades.reduce((a, b) => a + b, 0) / grades.length;
  const diff = weighted - simpleAvg;

  const prom = Math.round(weighted * 100) / 100;

  // --- Detect scale (4.0 vs 10.0) ---
  const isScale4 = grades.every(g => g <= 4.0) && grades.some(g => g <= 4.0);
  const passing4 = 2.0;
  const passing10 = 4.0;

  // --- Category ---
  let catEn: string, cat: string, tone: 'good' | 'warn' | 'neutral';
  if (isScale4) {
    if (prom >= 3.7) { catEn = 'A range'; cat = 'excelente'; tone = 'good'; }
    else if (prom >= 3.0) { catEn = 'B range'; cat = 'bueno'; tone = 'good'; }
    else if (prom >= 2.0) { catEn = 'C range'; cat = 'regular'; tone = 'neutral'; }
    else { catEn = 'at risk'; cat = 'en riesgo'; tone = 'warn'; }
  } else {
    if (prom >= 8) { catEn = 'distinguished'; cat = 'distinguido'; tone = 'good'; }
    else if (prom >= 6) { catEn = 'solid pass'; cat = 'aprobado'; tone = 'neutral'; }
    else if (prom >= 4) { catEn = 'needs work'; cat = 'a recuperar'; tone = 'warn'; }
    else { catEn = 'failing'; cat = 'desaprobatorio'; tone = 'warn'; }
  }

  // --- Credit effect insight ---
  const effectEn = Math.abs(diff) < 0.05
    ? 'Credit weighting has almost no effect vs a simple average for your courses.'
    : diff > 0
      ? `Credit weighting raised your average by **${diff.toFixed(2)}** vs the simple mean (${simpleAvg.toFixed(2)}): your higher-graded courses carry more credits.`
      : `Credit weighting lowered your average by **${Math.abs(diff).toFixed(2)}** vs the simple mean (${simpleAvg.toFixed(2)}): your heavier courses are dragging the average down.`;
  const effectEs = Math.abs(diff) < 0.05
    ? 'La ponderación por créditos no cambia casi nada vs el promedio simple en tus materias.'
    : diff > 0
      ? `Ponderar por créditos te **sube ${diff.toFixed(2)}** vs el promedio simple (${simpleAvg.toFixed(2)}): tus mejores notas están en las materias de más créditos.`
      : `Ponderar por créditos te **baja ${Math.abs(diff).toFixed(2)}** vs el promedio simple (${simpleAvg.toFixed(2)}): las materias con más créditos te están pesando más.`;

  const insText = __lang === 'en'
    ? `Weighted average: **${prom.toFixed(2)}** across ${grades.length} course(s) (${totalCredits} total credits) — **${catEn}** level. ${effectEn}`
    : `Promedio ponderado: **${prom.toFixed(2)}** en ${grades.length} materia(s) (${totalCredits} créditos totales) — nivel **${cat}**. ${effectEs}`;

  const _insight = {
    title: T.insTitle,
    text: insText,
    tone,
    icon: '🎓',
  };

  // --- Chart: scale based on detected grading system ---
  const scaleMax = isScale4 ? 4.0 : 10;
  const _chart = {
    type: 'scale' as const,
    marker: prom,
    markerLabel: prom.toFixed(2),
    min: 0,
    segments: isScale4
      ? [
          { nombre: __lang === 'en' ? 'At risk (<2.0)' : 'En riesgo', max: 2.0, color: '#ef4444', colorDark: '#dc2626' },
          { nombre: __lang === 'en' ? 'C range (2.0–3.0)' : 'Regular', max: 3.0, color: '#f59e0b', colorDark: '#d97706' },
          { nombre: __lang === 'en' ? 'B range (3.0–3.7)' : 'Bueno', max: 3.7, color: '#84cc16', colorDark: '#65a30d' },
          { nombre: __lang === 'en' ? 'A range (3.7–4.0)' : 'Excelente', max: 4.0, color: '#22c55e', colorDark: '#16a34a' },
        ]
      : [
          { nombre: __lang === 'en' ? 'Failing' : 'Desaprobado', max: 4, color: '#ef4444', colorDark: '#dc2626' },
          { nombre: __lang === 'en' ? 'Needs work' : 'A recuperar', max: 6, color: '#f59e0b', colorDark: '#d97706' },
          { nombre: __lang === 'en' ? 'Pass' : 'Aprobado', max: 8, color: '#84cc16', colorDark: '#65a30d' },
          { nombre: __lang === 'en' ? 'Distinguished' : 'Distinguido', max: 10, color: '#22c55e', colorDark: '#16a34a' },
        ],
    ariaLabel: __lang === 'en'
      ? `Weighted average ${prom.toFixed(2)} on a 0 to ${scaleMax} scale`
      : `Promedio ponderado ${prom.toFixed(2)} en escala 0 a ${scaleMax}`,
  };

  const resumen = __lang === 'en'
    ? `Weighted average: ${prom.toFixed(2)} (${grades.length} course(s), ${totalCredits} credits). Formula: Σ(grade × credits) ÷ Σ(credits) = ${sumWeighted.toFixed(2)} ÷ ${totalCredits} = ${prom.toFixed(2)}.`
    : `Promedio ponderado: ${prom.toFixed(2)} (${grades.length} materia(s), ${totalCredits} créditos). Fórmula: Σ(nota × créditos) ÷ Σ(créditos) = ${sumWeighted.toFixed(2)} ÷ ${totalCredits} = ${prom.toFixed(2)}.`;

  return { resultado: prom.toFixed(2), resumen, _insight, _chart };
}
