export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Vitamin D: Daily Sun Exposure & Supplement Dose Estimator
 *
 * Method:
 *  - Sun minutes to synthesise ~1,000 IU: base time by Fitzpatrick skin phototype
 *    (sourced from Holick 2004, Nair & Maseeh 2012, MDPI Nutrients 2024 global model)
 *    adjusted by latitude zone × season × age reduction factor.
 *  - Recommended supplement IU: IOM/NASEM Dietary Reference Intakes (2011)
 *    updated with 2024 Endocrine Society Clinical Practice Guideline.
 *
 * Inputs:
 *  edad          – age in years (1–100)
 *  fototipo      – Fitzpatrick skin phototype: 1-6
 *  zona_latitud  – latitude zone: "tropical" | "subtropical" | "templada" | "alta"
 *  estacion      – season: "verano" | "primavera" | "otono" | "invierno"
 *  minutos_sol   – actual daily sun exposure in minutes (0–180)
 *
 * Outputs:
 *  resultado     – estimated minutes of midday sun to synthesise ~1,000 IU
 *  resumen       – recommended daily supplement dose + interpretation
 */
export function vitaminaDDosisSolDiariaEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // --- Parse inputs ---
  const edad = Math.max(0, Math.min(120, Number(i.edad) || 0));
  const fototipo = Math.max(1, Math.min(6, Math.round(Number(i.fototipo) || 2)));
  const zona = String(i.zona_latitud || 'templada');
  const estacion = String(i.estacion || 'verano');
  const minutosSol = Math.max(0, Math.min(180, Number(i.minutos_sol) || 0));

  // -----------------------------------------------------------------
  // 1. Base minutes (midday, clear sky, arms & face uncovered) to
  //    synthesise ~1,000 IU pre-vitamin D3 — Fitzpatrick phototype.
  //    Source: Holick 2004 / Nair & Maseeh 2012 / MDPI Nutrients 2024
  //    (average annual, temperate latitude ~35-40°).
  // -----------------------------------------------------------------
  const baseMinByPhototype: Record<number, number> = {
    1: 5,   // very fair, always burns
    2: 8,   // fair, usually burns
    3: 13,  // medium, sometimes burns
    4: 20,  // olive, rarely burns
    5: 28,  // brown/dark, very rarely burns
    6: 45,  // very dark/black skin
  };
  const baseMin = baseMinByPhototype[fototipo] ?? 13;

  // -----------------------------------------------------------------
  // 2. Latitude zone multiplier
  //    tropical ≤ 23°: ~0.5× (stronger UVB year-round)
  //    subtropical 23-35°: ~0.75×
  //    templada 35-50°: 1× (reference)
  //    alta > 50°: ~1.8×
  //    Source: Holick 2007 "Vitamin D Deficiency"; Linus Pauling Inst.
  // -----------------------------------------------------------------
  const latMultiplier: Record<string, number> = {
    tropical: 0.5,
    subtropical: 0.75,
    templada: 1.0,
    alta: 1.8,
  };
  const latMult = latMultiplier[zona] ?? 1.0;

  // -----------------------------------------------------------------
  // 3. Season multiplier (effect on solar angle / UVB availability)
  //    Source: Holick 2004; in Boston (42°N) no useful UVB Nov-Mar.
  //    Applied on top of latitude — in "alta" latitude winter,
  //    synthesis is effectively impossible (>180 min).
  // -----------------------------------------------------------------
  const seasonMultiplier: Record<string, number> = {
    verano: 1.0,   // summer: optimal UVB
    primavera: 1.4, // spring: slightly reduced angle
    otono: 1.6,    // autumn: further reduced
    invierno: 3.5, // winter: very low UVB (or none at high lat.)
  };
  const seasonMult = seasonMultiplier[estacion] ?? 1.0;

  // -----------------------------------------------------------------
  // 4. Age reduction factor for cutaneous vitamin D synthesis
  //    At 70+ years, skin synthesis efficiency is ~25-30% lower.
  //    Source: Webb & Engelsen 2006; MDPI Nutrients 2012 (MacLaughlin)
  // -----------------------------------------------------------------
  let ageFactor = 1.0;
  if (edad >= 70) ageFactor = 1.35;
  else if (edad >= 50) ageFactor = 1.15;
  else if (edad < 5) ageFactor = 0.85; // infants synthesise efficiently

  // -----------------------------------------------------------------
  // 5. Compute estimated minutes needed for ~1,000 IU synthesis
  // -----------------------------------------------------------------
  const minutosNecesarios = Math.round(baseMin * latMult * seasonMult * ageFactor);
  // Cap at 180 — beyond that, supplementation is the practical answer
  const minutesCapped = Math.min(minutosNecesarios, 180);
  const synthesisImpossible = minutosNecesarios > 180;

  // -----------------------------------------------------------------
  // 6. Estimated IU produced from the user's actual daily sun exposure
  //    Inverse of the synthesis formula (linear approximation).
  //    Only meaningful when minutosSol > 0.
  // -----------------------------------------------------------------
  let iuFromSun = 0;
  if (!synthesisImpossible && minutosSol > 0) {
    iuFromSun = Math.round((minutosSol / minutesNeeded(minutosNecesarios)) * 1000);
  }
  function minutesNeeded(m: number): number { return Math.max(1, m); }

  // -----------------------------------------------------------------
  // 7. Recommended supplement IU by age group
  //    IOM/NASEM 2011 RDA (primary) + 2024 Endocrine Society note.
  // -----------------------------------------------------------------
  let rdaMin: number, rdaMax: number;
  let rdaLabel_es: string, rdaLabel_en: string;

  if (edad < 1) {
    rdaMin = 400; rdaMax = 400;
    rdaLabel_es = 'Lactante (0-12 meses)';
    rdaLabel_en = 'Infant (0–12 months)';
  } else if (edad <= 13) {
    rdaMin = 600; rdaMax = 600;
    rdaLabel_es = 'Niño/a (1-13 años)';
    rdaLabel_en = 'Child (1–13 years)';
  } else if (edad <= 18) {
    rdaMin = 600; rdaMax = 600;
    rdaLabel_es = 'Adolescente (14-18 años)';
    rdaLabel_en = 'Adolescent (14–18 years)';
  } else if (edad <= 70) {
    rdaMin = 600; rdaMax = 800;
    rdaLabel_es = 'Adulto (19-70 años)';
    rdaLabel_en = 'Adult (19–70 years)';
  } else {
    rdaMin = 800; rdaMax = 1000;
    rdaLabel_es = 'Adulto mayor (>70 años)';
    rdaLabel_en = 'Older adult (>70 years)';
  }

  // -----------------------------------------------------------------
  // 8. Build human-readable result strings
  // -----------------------------------------------------------------
  const sunLabel = __lang === 'en'
    ? (synthesisImpossible
      ? 'Synthesis not feasible with sun alone in this season/latitude — supplement recommended'
      : `~${minutesCapped} min of midday sun (arms & face) ≈ 1,000 IU`)
    : (synthesisImpossible
      ? 'Síntesis solar no factible en esta estación/latitud — suplemento indispensable'
      : `~${minutesCapped} min de sol al mediodía (brazos y cara) ≈ 1.000 UI`);

  const resultado = sunLabel;

  // Supplement recommendation
  const supRec = __lang === 'en'
    ? `${rdaLabel_en}: ${rdaMin === rdaMax ? rdaMin : `${rdaMin}–${rdaMax}`} IU/day (IOM/NASEM RDA)`
    : `${rdaLabel_es}: ${rdaMin === rdaMax ? rdaMin : `${rdaMin}–${rdaMax}`} UI/día (IOM/NASEM RDA)`;

  let sunContrib = '';
  if (minutosSol > 0 && !synthesisImpossible) {
    sunContrib = __lang === 'en'
      ? ` Your ${minutosSol} min/day provides ~${iuFromSun} IU from sun.`
      : ` Tus ${minutosSol} min/día aportan ~${iuFromSun} UI del sol.`;
  }

  const resumen = supRec + sunContrib;

  // -----------------------------------------------------------------
  // 9. Insight block
  // -----------------------------------------------------------------
  let tone: 'neutral' | 'warning' | 'good' | 'bad' = 'neutral';
  if (synthesisImpossible) tone = 'warning';
  else if (minutosSol >= minutesCapped) tone = 'good';

  const insightText_es = synthesisImpossible
    ? `En esta estación y latitud la síntesis cutánea de vitamina D es prácticamente nula. La suplementación de **${rdaMin}–${rdaMax} UI/día** es indispensable para fototipo ${fototipo} en estas condiciones.`
    : minutosSol >= minutesCapped
      ? `Con **${minutosSol} minutos** de sol al día cubrís aproximadamente tu necesidad de síntesis (~1.000 UI). Igualmente, para tu grupo etario el IOM recomienda **${rdaMin}–${rdaMax} UI/día** — el sol puede cubrirlo si la exposición es regular.`
      : `Necesitás **~${minutesCapped} minutos** de sol al mediodía para sintetizar ~1.000 UI. Si solo accedés a ${minutosSol > 0 ? minutosSol + ' min' : 'poco sol'}, considerá suplementar **${rdaMin}–${rdaMax} UI/día**.`;

  const insightText_en = synthesisImpossible
    ? `In this season and latitude, cutaneous vitamin D synthesis is nearly zero. Supplementation of **${rdaMin}–${rdaMax} IU/day** is essential for skin type ${fototipo} under these conditions.`
    : minutosSol >= minutesCapped
      ? `With **${minutosSol} minutes** of daily sun you approximately cover your synthesis needs (~1,000 IU). The IOM recommends **${rdaMin}–${rdaMax} IU/day** for your age group — regular sun exposure can meet this.`
      : `You need **~${minutesCapped} minutes** of midday sun to synthesise ~1,000 IU. If you only get ${minutosSol > 0 ? minutosSol + ' min' : 'little sun'}, consider supplementing **${rdaMin}–${rdaMax} IU/day**.`;

  const _insight = {
    title: __lang === 'en' ? 'Your vitamin D estimate' : 'Tu estimación de vitamina D',
    text: __lang === 'en' ? insightText_en : insightText_es,
    tone,
    icon: '☀️',
  };

  return {
    resultado,
    resumen,
    _insight,
  };
}
