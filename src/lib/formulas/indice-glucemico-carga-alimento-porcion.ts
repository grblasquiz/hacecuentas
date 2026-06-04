export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }

/**
 * Glycemic Index (GI) and Glycemic Load (GL) Calculator
 *
 * Formula (Harvard / University of Sydney / FAO-WHO 1997):
 *   GL = (GI × available_carbs_per_serving_g) / 100
 *
 * GI Classification (WHO/FAO & University of Sydney):
 *   Low GI:    ≤ 55
 *   Medium GI: 56–69
 *   High GI:   ≥ 70
 *
 * GL Classification (Harvard School of Public Health):
 *   Low GL:    ≤ 10
 *   Medium GL: 11–19
 *   High GL:   ≥ 20
 *
 * Sources:
 *   - Atkinson et al., Am J Clin Nutr 2008 (International GI Tables)
 *   - Salmeron et al., JAMA 1997 (GL concept, Harvard)
 *   - FAO/WHO Expert Consultation 1998
 */

export function indiceGlucemicoCargaAlimentoPorcion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const gi = Number(i.ig) || 0;
  const carbs = Number(i.carbohidratos) || 0;

  // Core formula: GL = (GI × carbs_per_serving) / 100
  const gl = (gi * carbs) / 100;

  // --- GI classification ---
  let giCat: string;
  let giCatEs: string;
  if (gi === 0) {
    giCat = '—';
    giCatEs = '—';
  } else if (gi <= 55) {
    giCat = 'Low GI';
    giCatEs = 'IG bajo';
  } else if (gi <= 69) {
    giCat = 'Medium GI';
    giCatEs = 'IG medio';
  } else {
    giCat = 'High GI';
    giCatEs = 'IG alto';
  }

  // --- GL classification ---
  let glCat: string;
  let glCatEs: string;
  let glTone: string;
  if (gl === 0 && gi === 0 && carbs === 0) {
    glCat = '—';
    glCatEs = '—';
    glTone = 'neutral';
  } else if (gl <= 10) {
    glCat = 'Low GL';
    glCatEs = 'CG baja';
    glTone = 'positive';
  } else if (gl <= 19) {
    glCat = 'Medium GL';
    glCatEs = 'CG media';
    glTone = 'neutral';
  } else {
    glCat = 'High GL';
    glCatEs = 'CG alta';
    glTone = 'warning';
  }

  const glRounded = gl.toFixed(1);

  // --- Bilingual outputs ---
  const resumen = __lang === 'en'
    ? `Glycemic Load: ${glRounded} (${glCat}) | Glycemic Index: ${gi} (${giCat}) | Available carbs: ${carbs} g. Formula: GL = (${gi} × ${carbs}) ÷ 100 = ${glRounded}.`
    : `Carga glucémica: ${glRounded} (${glCatEs}) | Índice glucémico: ${gi} (${giCatEs}) | Carbohidratos disponibles: ${carbs} g. Fórmula: CG = (${gi} × ${carbs}) ÷ 100 = ${glRounded}.`;

  const insightTitle = __lang === 'en'
    ? `Glycemic Load: ${glRounded} — ${glCat}`
    : `Carga glucémica: ${glRounded} — ${glCatEs}`;

  let insightText: string;
  if (gi === 0 && carbs === 0) {
    insightText = __lang === 'en'
      ? `Enter the food's glycemic index and the grams of available carbohydrates per serving to calculate the glycemic load.`
      : `Ingresá el índice glucémico del alimento y los gramos de carbohidratos disponibles por porción para calcular la carga glucémica.`;
  } else if (__lang === 'en') {
    if (gl <= 10) {
      insightText = `With a GL of **${glRounded}**, this food has a **low glycemic impact** on your blood sugar for this serving size. The portion contains only ${carbs} g of available carbs, keeping the overall impact low even if the GI is elevated.`;
    } else if (gl <= 19) {
      insightText = `With a GL of **${glRounded}**, this food has a **moderate glycemic impact**. Pairing it with protein, healthy fat, or fiber can help blunt the blood sugar rise.`;
    } else {
      insightText = `With a GL of **${glRounded}**, this food has a **high glycemic impact** — it is likely to produce a significant blood sugar spike. Consider reducing the portion size or combining it with lower-GI foods.`;
    }
  } else {
    if (gl <= 10) {
      insightText = `Con una CG de **${glRounded}**, este alimento tiene un **impacto glucémico bajo** para esta porción. La porción aporta solo ${carbs} g de carbohidratos disponibles, manteniendo el impacto global bajo aunque el IG sea elevado.`;
    } else if (gl <= 19) {
      insightText = `Con una CG de **${glRounded}**, este alimento tiene un **impacto glucémico moderado**. Combinarlo con proteína, grasa saludable o fibra puede ayudar a amortiguar el pico de azúcar en sangre.`;
    } else {
      insightText = `Con una CG de **${glRounded}**, este alimento tiene un **impacto glucémico alto** — es probable que produzca un pico significativo de glucosa. Considerá reducir el tamaño de la porción o combinarlo con alimentos de IG bajo.`;
    }
  }

  const insight = {
    title: insightTitle,
    text: insightText,
    tone: glTone,
    icon: '🍞',
  };

  return {
    resultado: glRounded,
    resumen,
    _insight: insight,
  };
}
