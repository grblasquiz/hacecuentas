export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }

/**
 * BMI / IMC for adults 65+ with geriatric-specific ranges.
 *
 * Formula: BMI = weight_kg / (height_m)^2
 *
 * Ranges used:
 *  - Standard WHO/CDC adult categories (official, always shown)
 *  - Geriatric interpretation based on ESPEN 2018 consensus and
 *    Winter et al. Am J Clin Nutr 2014 (lowest mortality at BMI 27-28 in 65+)
 *
 * Inputs:
 *   peso_kg   — body weight in kg
 *   altura_cm — standing height in cm
 */
export function imcAdultosMayoresEdadTabla(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const peso_kg = Number(i.peso_kg) || 0;
  const altura_cm = Number(i.altura_cm) || 0;

  if (peso_kg <= 0 || altura_cm <= 0) {
    const err = __lang === 'en'
      ? 'Enter a valid weight and height.'
      : 'Ingresá un peso y una altura válidos.';
    return { resultado: '', resumen: err, _insight: { title: '', text: err, tone: 'neutral', icon: '⚖️' } };
  }

  const altura_m = altura_cm / 100;
  const imc = peso_kg / (altura_m * altura_m);
  const imcRounded = Math.round(imc * 10) / 10; // 1 decimal

  // ── WHO/CDC standard categories (reference) ──
  let catStandard_es: string;
  let catStandard_en: string;
  if (imc < 18.5) {
    catStandard_es = 'Bajo peso (OMS estándar)';
    catStandard_en = 'Underweight (standard WHO)';
  } else if (imc < 25) {
    catStandard_es = 'Normal (OMS estándar)';
    catStandard_en = 'Normal weight (standard WHO)';
  } else if (imc < 30) {
    catStandard_es = 'Sobrepeso (OMS estándar)';
    catStandard_en = 'Overweight (standard WHO)';
  } else if (imc < 35) {
    catStandard_es = 'Obesidad grado I (OMS estándar)';
    catStandard_en = 'Obesity class I (standard WHO)';
  } else if (imc < 40) {
    catStandard_es = 'Obesidad grado II (OMS estándar)';
    catStandard_en = 'Obesity class II (standard WHO)';
  } else {
    catStandard_es = 'Obesidad grado III (OMS estándar)';
    catStandard_en = 'Obesity class III (standard WHO)';
  }

  // ── Geriatric-adjusted ranges (ESPEN 2018 / Winter 2014) ──
  // ESPEN Clinical Nutrition 2018 & consensus: <22 = malnutrition risk;
  // 22-27 = healthy in 65+; 27-30 = overweight (low risk); >30 = obesity
  let catGeriatric_es: string;
  let catGeriatric_en: string;
  let tono: string;

  if (imc < 22) {
    catGeriatric_es = 'Riesgo nutricional / bajo peso (≥65 años, ESPEN)';
    catGeriatric_en = 'Nutritional risk / underweight (age 65+, ESPEN)';
    tono = 'warning';
  } else if (imc < 27) {
    catGeriatric_es = 'Peso saludable (≥65 años, ESPEN)';
    catGeriatric_en = 'Healthy weight (age 65+, ESPEN)';
    tono = 'positive';
  } else if (imc < 30) {
    catGeriatric_es = 'Sobrepeso leve — riesgo bajo (≥65 años, ESPEN)';
    catGeriatric_en = 'Mild overweight — low risk (age 65+, ESPEN)';
    tono = 'neutral';
  } else if (imc < 35) {
    catGeriatric_es = 'Obesidad grado I (≥65 años)';
    catGeriatric_en = 'Obesity class I (age 65+)';
    tono = 'warning';
  } else {
    catGeriatric_es = 'Obesidad grado II-III (≥65 años)';
    catGeriatric_en = 'Obesity class II-III (age 65+)';
    tono = 'warning';
  }

  // ── Unintentional weight loss reminder ──
  const disclaimer_es = 'Resultado informativo. No reemplaza la evaluación de un profesional de la salud.';
  const disclaimer_en = 'Informational result only. Not a substitute for clinical assessment.';

  const resumen = __lang === 'en'
    ? `IMC ${imcRounded} kg/m² — ${catStandard_en}. In adults 65+: ${catGeriatric_en}. ${disclaimer_en}`
    : `IMC ${imcRounded} kg/m² — ${catStandard_es}. En adultos ≥65 años: ${catGeriatric_es}. ${disclaimer_es}`;

  // ── Insight block ──
  const insightTitle = __lang === 'en'
    ? `BMI ${imcRounded} kg/m²`
    : `IMC ${imcRounded} kg/m²`;

  const insightText = __lang === 'en'
    ? `Your BMI is **${imcRounded} kg/m²**. By the standard WHO/CDC scale this is *${catStandard_en}*, but in adults **65 and older** the evidence-based healthy range shifts upward: **22–27 kg/m²** (ESPEN 2018). Your geriatric category: **${catGeriatric_en}**. A BMI below 22 signals nutritional risk; above 30 raises cardiometabolic concern. Consult your doctor for a personalised assessment.`
    : `Tu IMC es **${imcRounded} kg/m²**. Por la escala OMS estándar esto es *${catStandard_es}*, pero en adultos **≥65 años** el rango saludable basado en evidencia se desplaza hacia arriba: **22–27 kg/m²** (ESPEN 2018). Tu categoría geriátrica: **${catGeriatric_es}**. Un IMC menor a 22 indica riesgo nutricional; mayor a 30 sugiere riesgo cardiometabólico. Consultá con tu médico para una evaluación personalizada.`;

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone: tono,
    icon: '⚖️',
  };

  return {
    resultado: `${imcRounded} kg/m²`,
    resumen,
    _insight,
  };
}
