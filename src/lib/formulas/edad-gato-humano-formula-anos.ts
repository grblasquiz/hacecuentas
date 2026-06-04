export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Cat age to human years — AAFP/AAHA standard formula
 *
 * Year 1  = 15 human years
 * Year 2  = +9  → cumulative 24 human years
 * Year 3+ = +4 human years per additional cat year
 *
 * Formula for N ≥ 3:  human_age = 24 + (N − 2) × 4
 *
 * Sources:
 *   - 2021 AAHA/AAFP Feline Life Stage Guidelines
 *     https://www.aaha.org/resources/2021-aaha-aafp-feline-life-stage-guidelines/
 *   - AVMA / AAFP feline care recommendations
 *
 * Life stages (2021 AAHA/AAFP):
 *   Kitten       0 – <1 year
 *   Young Adult  1 – 6 years
 *   Mature Adult 7 – 10 years
 *   Senior       10+ years
 */
export function edadGatoHumanoFormulaAnos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const catAge = Math.max(0, Number(i.catAge) || 0);

  // --- Human-year equivalent (AAFP/AAHA formula) ---
  let humanAge: number;
  if (catAge <= 0) {
    humanAge = 0;
  } else if (catAge <= 1) {
    // Linear interpolation: 0 months = 0, 1 year = 15 human years
    humanAge = catAge * 15;
  } else if (catAge <= 2) {
    // Year 1→2 adds 9 human years (from 15 to 24)
    humanAge = 15 + (catAge - 1) * 9;
  } else {
    // Year 3+: each cat year = 4 human years
    humanAge = 24 + (catAge - 2) * 4;
  }

  const humanAgeRounded = Math.round(humanAge * 10) / 10;

  // --- Life stage (2021 AAHA/AAFP) ---
  let stage: string;
  let stageEN: string;
  let stageAdvice: string;
  let stageAdviceEN: string;

  if (catAge < 1) {
    stage = 'Cachorro (Kitten)';
    stageEN = 'Kitten';
    stageAdvice = 'Fase de crecimiento acelerado. Vacunación, desparasitación, socialización y esterilización temprana son prioridad.';
    stageAdviceEN = 'Rapid growth phase. Vaccination, deworming, socialisation and early spaying/neutering are priorities.';
  } else if (catAge <= 6) {
    stage = 'Adulto joven';
    stageEN = 'Young Adult';
    stageAdvice = 'En plena forma. Control veterinario anual, peso y dentadura. Buen momento para establecer la base de salud del gato.';
    stageAdviceEN = 'Prime health years. Annual vet check-up, weight and dental care. A good time to establish a health baseline.';
  } else if (catAge <= 10) {
    stage = 'Adulto maduro';
    stageEN = 'Mature Adult';
    stageAdvice = 'Aumentar controles a cada 6 meses. Análisis de sangre y orina anual. Mayor riesgo de hipertensión e inicio de IRC.';
    stageAdviceEN = 'Increase check-ups to every 6 months. Annual blood and urine panel. Higher risk of hypertension and early CKD.';
  } else {
    stage = 'Senior / Geriátrico';
    stageEN = 'Senior / Geriatric';
    stageAdvice = 'Controles cada 3-4 meses. Perfil tiroideo, función renal y presión arterial son los indicadores clave. Énfasis en confort y manejo del dolor.';
    stageAdviceEN = 'Check-ups every 3–4 months. Thyroid panel, kidney function and blood pressure are key indicators. Focus on comfort and pain management.';
  }

  // --- Insight ---
  const humanAgeDisplay = humanAgeRounded % 1 === 0 ? humanAgeRounded.toString() : humanAgeRounded.toFixed(1);

  const _insight = {
    title: __lang === 'en' ? `Your cat's life stage: ${stageEN}` : `Etapa vital: ${stage}`,
    text: __lang === 'en'
      ? `A **${catAge}-year-old cat** is equivalent to **${humanAgeDisplay} human years**. Life stage: **${stageEN}**. ${stageAdviceEN}`
      : `Un gato de **${catAge} años** equivale a **${humanAgeDisplay} años humanos**. Etapa: **${stage}**. ${stageAdvice}`,
    tone: catAge >= 10 ? 'warning' : 'neutral',
    icon: '🐱',
  };

  // --- Resumen text (output field) ---
  const stageLabel = __lang === 'en' ? stageEN : stage;
  const resumen = __lang === 'en'
    ? `${stageLabel} — ${stageAdviceEN}`
    : `${stageLabel} — ${stageAdvice}`;

  return {
    resultado: humanAgeDisplay,
    resumen,
    _insight,
  };
}
