export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Calcium Daily Requirement Calculator
 * Source: Institute of Medicine (IOM) 2011 Dietary Reference Intakes for Calcium and Vitamin D
 * Confirmed by NIH Office of Dietary Supplements Calcium Fact Sheet for Health Professionals
 * https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/
 */

interface StageResult {
  rda: number;
  ul: number;
  isAI: boolean;
  stageName_es: string;
  stageName_en: string;
}

function getCalciumRequirement(
  ageYears: number,
  sex: string,       // 'male' | 'female'
  lifeStage: string  // 'normal' | 'pregnant' | 'lactating'
): StageResult {
  // Pregnancy & lactation override (only female)
  if (sex === 'female' && lifeStage === 'pregnant') {
    if (ageYears < 19) {
      // Adolescents 14-18 pregnant
      return { rda: 1300, ul: 3000, isAI: false, stageName_es: 'Embarazada ≤18 años', stageName_en: 'Pregnant ≤18 years' };
    }
    // Adults 19-50 pregnant
    return { rda: 1000, ul: 2500, isAI: false, stageName_es: 'Embarazada adulta (19-50 años)', stageName_en: 'Pregnant adult (19–50 years)' };
  }

  if (sex === 'female' && lifeStage === 'lactating') {
    if (ageYears < 19) {
      // Adolescents 14-18 lactating
      return { rda: 1300, ul: 3000, isAI: false, stageName_es: 'Lactando ≤18 años', stageName_en: 'Lactating ≤18 years' };
    }
    // Adults 19-50 lactating
    return { rda: 1000, ul: 2500, isAI: false, stageName_es: 'Lactando adulta (19-50 años)', stageName_en: 'Lactating adult (19–50 years)' };
  }

  // Infants (AI, not RDA)
  if (ageYears < 0.5) {
    return { rda: 200, ul: 1000, isAI: true, stageName_es: 'Lactante 0-6 meses', stageName_en: 'Infant 0–6 months' };
  }
  if (ageYears < 1) {
    return { rda: 260, ul: 1500, isAI: true, stageName_es: 'Lactante 7-12 meses', stageName_en: 'Infant 7–12 months' };
  }

  // Children
  if (ageYears < 4) {
    return { rda: 700, ul: 2500, isAI: false, stageName_es: 'Niño/a 1-3 años', stageName_en: 'Child 1–3 years' };
  }
  if (ageYears < 9) {
    return { rda: 1000, ul: 2500, isAI: false, stageName_es: 'Niño/a 4-8 años', stageName_en: 'Child 4–8 years' };
  }

  // Adolescents (9-18)
  if (ageYears < 19) {
    return { rda: 1300, ul: 3000, isAI: false, stageName_es: 'Adolescente 9-18 años', stageName_en: 'Adolescent 9–18 years' };
  }

  // Adults 19-50
  if (ageYears <= 50) {
    return { rda: 1000, ul: 2500, isAI: false, stageName_es: 'Adulto/a 19-50 años', stageName_en: 'Adult 19–50 years' };
  }

  // 51-70
  if (ageYears <= 70) {
    if (sex === 'female') {
      // Post-menopause women (≥51): 1200 mg
      return { rda: 1200, ul: 2000, isAI: false, stageName_es: 'Mujer 51-70 años (post-menopausia)', stageName_en: 'Women 51–70 years (post-menopause)' };
    }
    // Men 51-70
    return { rda: 1000, ul: 2000, isAI: false, stageName_es: 'Varón 51-70 años', stageName_en: 'Man 51–70 years' };
  }

  // 71+: both sexes 1200 mg
  return { rda: 1200, ul: 2000, isAI: false, stageName_es: 'Adulto/a ≥71 años', stageName_en: 'Adult ≥71 years' };
}

export function calcioDiarioEdadLactanciaMenopausia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const ageRaw = Number(i.edad);
  const sex = String(i.sexo || 'female');
  const lifeStage = String(i.etapa || 'normal');

  // Validate age
  const ageYears = Number.isFinite(ageRaw) && ageRaw >= 0 ? ageRaw : 0;

  const stage = getCalciumRequirement(ageYears, sex, lifeStage);

  const rdaMg = stage.rda;
  const ulMg = stage.ul;
  const dayLabel = __lang === 'en' ? '/day' : '/día';
  const typeLabel = stage.isAI
    ? (__lang === 'en' ? 'Adequate Intake (AI)' : 'Ingesta Adecuada (IA)')
    : (__lang === 'en' ? 'Recommended Dietary Allowance (RDA)' : 'Cantidad Diaria Recomendada (CDR)');

  const stageName = __lang === 'en' ? stage.stageName_en : stage.stageName_es;

  // Tone based on clinical context
  let tone: string;
  if (rdaMg >= 1300) {
    tone = 'warning'; // high-need stage (adolescents, pregnant teen)
  } else if (rdaMg >= 1200) {
    tone = 'info';    // elevated need (post-menopause, 71+)
  } else {
    tone = 'positive';
  }

  // Build equivalences (common food sources to hit RDA)
  // 1 glass milk = ~300 mg, 1 cup yogurt = ~300 mg, 30g hard cheese = ~300 mg
  const servingsMilk = Math.ceil(rdaMg / 300);

  const resultado = `${rdaMg} mg${dayLabel}`;

  let resumen: string;
  if (__lang === 'en') {
    resumen =
      `**${stageName}** — ${typeLabel}: **${rdaMg} mg/day** | Upper safe limit (UL): ${ulMg} mg/day. ` +
      `To reach your daily target through diet: approximately ${servingsMilk} cup${servingsMilk > 1 ? 's' : ''} of milk (300 mg each) or equivalent dairy/fortified foods. ` +
      `Vitamin D is required for adequate calcium absorption.`;
  } else {
    resumen =
      `**${stageName}** — ${typeLabel}: **${rdaMg} mg/día** | Límite superior seguro (LS): ${ulMg} mg/día. ` +
      `Para llegar a la meta diaria solo con alimentos: aproximadamente ${servingsMilk} vaso${servingsMilk > 1 ? 's' : ''} de leche (300 mg c/u) o equivalentes lácteos/fortificados. ` +
      `La vitamina D es necesaria para una absorción adecuada de calcio.`;
  }

  const _insight = {
    title: __lang === 'en' ? 'Your daily calcium target' : 'Tu meta diaria de calcio',
    text: __lang === 'en'
      ? `For **${stageName}**, the ${typeLabel} is **${rdaMg} mg/day**. The tolerable upper limit is **${ulMg} mg/day** — staying below this reduces the risk of kidney stones and soft-tissue calcification.`
      : `Para **${stageName}**, la ${typeLabel} es **${rdaMg} mg/día**. El límite superior tolerable es **${ulMg} mg/día** — mantenerse por debajo reduce el riesgo de cálculos renales y calcificación de tejidos blandos.`,
    tone,
    icon: '🥛',
  };

  return { resultado, resumen, _insight };
}
