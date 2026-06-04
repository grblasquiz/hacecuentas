export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Daily Dietary Fiber Adequate Intake (AI) by age and sex
 * Source: National Academies of Sciences, Engineering, and Medicine (NASEM) / Institute of Medicine
 * Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids (2002/2005)
 * Values verified against AND (Academy of Nutrition and Dietetics) and USDA DRI tables.
 * Rule: 14 g of total fiber per 1,000 kcal consumed.
 * Pregnancy AI: 28 g/d; Lactation AI: 29 g/d (unchanged from 2002 DRIs).
 */
function getFiberAI(age: number, sexo: string): number {
  // Pregnancy and lactation override age/sex
  if (sexo === 'embarazo') return 28;
  if (sexo === 'lactancia') return 29;

  // Children and adolescents
  if (age < 1) return 0; // Not applicable for infants
  if (age <= 3) return 19;     // 1-3 years: 19 g/d (both sexes)
  if (age <= 8) return 25;     // 4-8 years: 25 g/d (both sexes)

  if (sexo === 'masculino') {
    if (age <= 13) return 31;  // 9-13 years boys: 31 g/d
    if (age <= 18) return 38;  // 14-18 years boys: 38 g/d
    if (age <= 50) return 38;  // 19-50 years men: 38 g/d
    return 30;                  // 51+ years men: 30 g/d
  } else {
    // femenino (female)
    if (age <= 13) return 26;  // 9-13 years girls: 26 g/d
    if (age <= 18) return 26;  // 14-18 years girls: 26 g/d
    if (age <= 50) return 25;  // 19-50 years women: 25 g/d
    return 21;                  // 51+ years women: 21 g/d
  }
}

function getFoodExamples(fiberG: number, lang: 'es' | 'en'): string {
  if (lang === 'en') {
    if (fiberG <= 21) {
      return `1 cup raspberries (8 g) + 1 cup cooked broccoli (5 g) + ½ cup cooked lentils (8 g) = ~21 g`;
    } else if (fiberG <= 25) {
      return `1 cup raspberries (8 g) + 1 cup cooked lentils (15 g) + 1 oz almonds (3.5 g) = ~26 g`;
    } else if (fiberG <= 30) {
      return `1 cup black beans (15 g) + 1 cup raspberries (8 g) + 1 medium pear with skin (5.5 g) = ~29 g`;
    } else {
      return `1 cup black beans (15 g) + 1 cup raspberries (8 g) + ½ cup dry oats (4 g) + 1 medium pear (5.5 g) + 2 Tbsp chia seeds (10 g) = ~43 g`;
    }
  } else {
    if (fiberG <= 21) {
      return `1 taza de frambuesas (8 g) + 1 taza de brócoli cocido (5 g) + ½ taza de lentejas (8 g) = ~21 g`;
    } else if (fiberG <= 25) {
      return `1 taza de frambuesas (8 g) + 1 taza de lentejas cocidas (15 g) + 30 g de almendras (3.5 g) = ~26 g`;
    } else if (fiberG <= 30) {
      return `1 taza de porotos negros (15 g) + 1 taza de frambuesas (8 g) + 1 pera mediana con cáscara (5.5 g) = ~29 g`;
    } else {
      return `1 taza de porotos negros (15 g) + 1 taza de frambuesas (8 g) + ½ taza de avena seca (4 g) + 1 pera (5.5 g) + 2 cdas de semillas de chía (10 g) = ~43 g`;
    }
  }
}

function getInsightTone(fiberG: number): string {
  if (fiberG >= 35) return 'success';
  if (fiberG >= 25) return 'info';
  if (fiberG >= 19) return 'warning';
  return 'neutral';
}

export function fibraDieteticaRecomendadaDiariaEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const edad = Number(i.edad) || 0;
  const sexo = String(i.sexo || '').toLowerCase();

  // Validate
  if (edad < 1 || edad > 120) {
    const errMsg = __lang === 'en'
      ? 'Enter a valid age (1–120 years).'
      : 'Ingresá una edad válida (1–120 años).';
    return { resultado: '—', resumen: errMsg, _insight: { title: __lang === 'en' ? 'Invalid input' : 'Dato inválido', text: errMsg, tone: 'neutral', icon: '⚠️' } };
  }

  if (!['masculino', 'femenino', 'embarazo', 'lactancia'].includes(sexo)) {
    const errMsg = __lang === 'en'
      ? 'Select a sex / life stage.'
      : 'Seleccioná sexo / etapa de vida.';
    return { resultado: '—', resumen: errMsg, _insight: { title: __lang === 'en' ? 'Invalid input' : 'Dato inválido', text: errMsg, tone: 'neutral', icon: '⚠️' } };
  }

  const fiberAI = getFiberAI(edad, sexo);
  const resultado = `${fiberAI} g/día`;

  // Build group label
  let grupoLabel = '';
  if (__lang === 'en') {
    if (sexo === 'embarazo') grupoLabel = 'Pregnancy';
    else if (sexo === 'lactancia') grupoLabel = 'Lactation';
    else if (sexo === 'masculino') {
      if (edad <= 3) grupoLabel = 'Children 1–3 years';
      else if (edad <= 8) grupoLabel = 'Children 4–8 years';
      else if (edad <= 13) grupoLabel = 'Boys 9–13 years';
      else if (edad <= 18) grupoLabel = 'Boys/Men 14–18 years';
      else if (edad <= 50) grupoLabel = 'Men 19–50 years';
      else grupoLabel = 'Men 51+ years';
    } else {
      if (edad <= 3) grupoLabel = 'Children 1–3 years';
      else if (edad <= 8) grupoLabel = 'Children 4–8 years';
      else if (edad <= 13) grupoLabel = 'Girls 9–13 years';
      else if (edad <= 18) grupoLabel = 'Girls/Women 14–18 years';
      else if (edad <= 50) grupoLabel = 'Women 19–50 years';
      else grupoLabel = 'Women 51+ years';
    }
  } else {
    if (sexo === 'embarazo') grupoLabel = 'Embarazo';
    else if (sexo === 'lactancia') grupoLabel = 'Lactancia';
    else if (sexo === 'masculino') {
      if (edad <= 3) grupoLabel = 'Niños/as 1–3 años';
      else if (edad <= 8) grupoLabel = 'Niños/as 4–8 años';
      else if (edad <= 13) grupoLabel = 'Varones 9–13 años';
      else if (edad <= 18) grupoLabel = 'Varones 14–18 años';
      else if (edad <= 50) grupoLabel = 'Hombres 19–50 años';
      else grupoLabel = 'Hombres mayores de 50';
    } else {
      if (edad <= 3) grupoLabel = 'Niños/as 1–3 años';
      else if (edad <= 8) grupoLabel = 'Niños/as 4–8 años';
      else if (edad <= 13) grupoLabel = 'Mujeres 9–13 años';
      else if (edad <= 18) grupoLabel = 'Mujeres 14–18 años';
      else if (edad <= 50) grupoLabel = 'Mujeres 19–50 años';
      else grupoLabel = 'Mujeres mayores de 50';
    }
  }

  const foodEx = getFoodExamples(fiberAI, __lang);

  let resumen = '';
  if (__lang === 'en') {
    resumen = `NASEM Adequate Intake for ${grupoLabel}: **${fiberAI} g/day** of total dietary fiber. Example plate to reach the target: ${foodEx}. Increase fiber gradually (~5 g/week) and drink 1.5–2 L of water daily to avoid GI discomfort.`;
  } else {
    resumen = `Ingesta Adecuada (IA) de la NASEM para ${grupoLabel}: **${fiberAI} g/día** de fibra dietética total. Ejemplo de plato para llegar al objetivo: ${foodEx}. Aumentá la fibra de forma gradual (~5 g/semana) y tomá 1.5–2 L de agua por día para evitar molestias digestivas.`;
  }

  const _insight = {
    title: __lang === 'en' ? `Daily Fiber Target: ${fiberAI} g` : `Objetivo de fibra: ${fiberAI} g/día`,
    text: __lang === 'en'
      ? `For **${grupoLabel}** the NASEM Adequate Intake is **${fiberAI} g/day**. The NHANES average intake in adults is only 15–16 g/day — roughly half the target. To reach **${fiberAI} g**, try: ${foodEx}.`
      : `Para **${grupoLabel}** la Ingesta Adecuada (NASEM) es **${fiberAI} g/día**. El consumo promedio en adultos ronda los 12–15 g/día — menos de la mitad. Para llegar a **${fiberAI} g**, por ejemplo: ${foodEx}.`,
    tone: getInsightTone(fiberAI),
    icon: '🌾',
  };

  return { resultado, resumen, _insight };
}
