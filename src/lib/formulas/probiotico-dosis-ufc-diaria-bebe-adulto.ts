export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }

/**
 * Probiotic Daily CFU Dosage Estimator
 *
 * Based on:
 * - World Gastroenterology Organisation (WGO) Global Guidelines: Probiotics and Prebiotics (2017, updated 2023)
 * - NIH Office of Dietary Supplements – Probiotics Fact Sheet
 * - PMC: Guidance on probiotics in children (PMC5969308)
 * - International Probiotics Association dosage guidance
 *
 * Dosage logic: age group + health condition → orientation range (billion CFU/day).
 * No weight parameter needed: WGO/NIH guidelines are not weight-based for standard use;
 * infant dosing is age-bracket-based (not per-kg) in available clinical evidence.
 */
export function probioticoDosisUfcDiariaBebeAdulto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // --- Inputs ---
  const grupoEdad = String(i.grupo_edad || '').trim();       // age group
  const condicion  = String(i.condicion || '').trim();        // health goal/condition
  const antibiotico = String(i.con_antibiotico || 'no').trim(); // concurrent antibiotic use

  // --- Age group → base range (billion CFU) ---
  type RangeKey =
    | 'bebe_0_6'      // 0–6 months
    | 'bebe_6_12'     // 6–12 months
    | 'nino_1_3'      // 1–3 years
    | 'nino_4_12'     // 4–12 years
    | 'adolescente'   // 13–17 years
    | 'adulto'        // 18–64 years
    | 'adulto_mayor'; // 65+ years

  interface DoseRange { min: number; max: number; }

  const baseByAge: Record<RangeKey, DoseRange> = {
    bebe_0_6:    { min: 0.1,  max: 1   },  // 100M–1B CFU (L. reuteri DSM 17938 pattern)
    bebe_6_12:   { min: 1,    max: 5   },  // 1B–5B CFU
    nino_1_3:    { min: 2,    max: 5   },  // 2B–5B CFU
    nino_4_12:   { min: 5,    max: 10  },  // 5B–10B CFU
    adolescente: { min: 5,    max: 20  },  // 5B–20B CFU
    adulto:      { min: 5,    max: 20  },  // General adult maintenance (WGO: 1–10B; practical market 5–20B)
    adulto_mayor:{ min: 5,    max: 15  },  // 5B–15B CFU (similar to adult but more conservative)
  };

  const validAgeGroups = Object.keys(baseByAge) as RangeKey[];
  const ageKey: RangeKey = validAgeGroups.includes(grupoEdad as RangeKey)
    ? (grupoEdad as RangeKey)
    : 'adulto';

  let { min, max } = baseByAge[ageKey];

  // --- Condition multipliers ---
  // Sources: WGO guidelines, IPA guidance, clinical trial dosing literature
  const isInfant = ageKey === 'bebe_0_6' || ageKey === 'bebe_6_12';

  if (!isInfant) {
    // Adults/children condition adjustments
    if (condicion === 'diarrea_antibiotico') {
      // AAD: doses ≥5B/day more effective; 10B/day effectiveness breakpoint (meta-analysis)
      min = Math.max(min, 10);
      max = Math.max(max, 30);
    } else if (condicion === 'sii') {
      // IBS: 5–50B depending on cepa; WGO notes 100M effective for some strains
      min = Math.max(min, 5);
      max = Math.max(max, 25);
    } else if (condicion === 'constipacion') {
      min = Math.max(min, 5);
      max = Math.max(max, 15);
    } else if (condicion === 'inmunidad') {
      // General immune support: maintenance range
      min = Math.max(min, 5);
      max = Math.max(max, 20);
    } else if (condicion === 'diarrea_aguda') {
      // Acute diarrhea: higher end clinical doses (LGG 10^10 recommended by WGO for children and adults)
      min = Math.max(min, 10);
      max = Math.max(max, 25);
    } else {
      // 'mantenimiento' or default
      // no change from age base
    }
  } else {
    // Infant-specific condition adjustments
    if (condicion === 'colicos') {
      // L. reuteri DSM 17938 for colic: 0.1B (10^8 CFU) clinically validated
      min = 0.1;
      max = 0.4;
    } else if (condicion === 'diarrea_aguda') {
      min = 1;
      max = 5;
    } else if (condicion === 'diarrea_antibiotico') {
      min = 1;
      max = 5;
    }
    // else mantenimiento/inmunidad: stay at age base
  }

  // --- Concurrent antibiotic boost (non-infant) ---
  if (antibiotico === 'si' && !isInfant) {
    // Space antibiotic ≥2h from probiotic; higher doses more protective
    min = Math.max(min, 10);
    max = Math.max(max, 30);
  }

  // --- Round to clean numbers ---
  const minR = min >= 1 ? Math.round(min) : min;
  const maxR = max >= 1 ? Math.round(max) : max;

  // --- Human-readable helpers ---
  const fmtBillion = (n: number, lang: string) => {
    if (n < 1) {
      const m = Math.round(n * 1000);
      return lang === 'en' ? `${m} million` : `${m} millones`;
    }
    if (n >= 1000) {
      return lang === 'en' ? `${(n/1000).toFixed(1)} trillion` : `${(n/1000).toFixed(1)} billones`;
    }
    return lang === 'en' ? `${n} billion` : `${n} mil millones`;
  };

  const minLabel = fmtBillion(minR, __lang);
  const maxLabel = fmtBillion(maxR, __lang);

  // --- Condition-specific strain note ---
  const strainHints: Record<string, { es: string; en: string }> = {
    diarrea_antibiotico: {
      es: 'Cepas con mayor evidencia: *Lactobacillus rhamnosus GG* y *Saccharomyces boulardii* CNCM I-745. Tomalos al menos 2 horas separado del antibiótico.',
      en: 'Best-evidence strains: *Lactobacillus rhamnosus GG* and *Saccharomyces boulardii* CNCM I-745. Take at least 2 hours apart from the antibiotic.',
    },
    sii: {
      es: 'Cepas con mayor evidencia para SII: *Bifidobacterium longum* 35624, *Lactobacillus acidophilus* NCFM o multicepa según predominio de síntomas.',
      en: 'Best-evidence strains for IBS: *Bifidobacterium longum* 35624, *Lactobacillus acidophilus* NCFM, or multi-strain blends matched to symptom pattern.',
    },
    constipacion: {
      es: 'Cepas con mayor evidencia para estreñimiento: *Bifidobacterium lactis* HN019, *Bifidobacterium animalis* DN-173 010.',
      en: 'Best-evidence strains for constipation: *Bifidobacterium lactis* HN019, *Bifidobacterium animalis* DN-173 010.',
    },
    inmunidad: {
      es: 'Para soporte inmunológico se estudian mezclas de Lactobacillus y Bifidobacterium. La evidencia es moderada; priorizá cepas identificadas con número de depósito.',
      en: 'Immune support is studied with Lactobacillus and Bifidobacterium blends. Evidence is moderate; prioritize strains identified by deposit number.',
    },
    diarrea_aguda: {
      es: 'Cepas con mayor evidencia para diarrea aguda: *Lactobacillus rhamnosus GG*, *Saccharomyces boulardii*. WGO recomienda 10¹⁰ UFC dos veces/día en adultos.',
      en: 'Best-evidence strains for acute diarrhea: *Lactobacillus rhamnosus GG*, *Saccharomyces boulardii*. WGO recommends 10¹⁰ CFU twice/day in adults.',
    },
    colicos: {
      es: 'La cepa con mayor evidencia en cólicos del lactante es *Lactobacillus reuteri* DSM 17938 (dosis: 10⁸ UFC/día, 21-30 días, exclusivamente lactantes amamantados).',
      en: 'The best-evidence strain for infantile colic is *Lactobacillus reuteri* DSM 17938 (dose: 10⁸ CFU/day, 21–30 days, breastfed infants primarily).',
    },
    mantenimiento: {
      es: 'Para mantenimiento general, la dieta variada rica en fibra y alimentos fermentados puede complementar o reemplazar los suplementos en personas sanas.',
      en: 'For general maintenance, a varied high-fiber diet with fermented foods can complement or replace supplements in healthy individuals.',
    },
  };

  const strainNote =
    strainHints[condicion]
      ? (__lang === 'en' ? strainHints[condicion].en : strainHints[condicion].es)
      : '';

  // --- Build outputs ---
  const resultado = `${minLabel} – ${maxLabel} UFC/día`;
  const resultadoEn = `${minLabel} – ${maxLabel} CFU/day`;

  const rangeNote = __lang === 'en'
    ? `Estimated daily CFU range for your profile: **${minLabel} – ${maxLabel} CFU/day**`
    : `Rango diario orientativo para tu perfil: **${minLabel} – ${maxLabel} UFC/día**`;

  const disclaimer = __lang === 'en'
    ? '_This is an orientation range based on clinical literature, not a medical prescription. Consult your doctor or pharmacist, especially for infants, pregnant women, or immunocompromised individuals._'
    : '_Este rango es orientativo basado en literatura clínica, no es una prescripción médica. Consultá con tu médico o farmacéutico, especialmente en bebés, embarazadas o personas inmunocomprometidas._';

  const resumen = __lang === 'en'
    ? [rangeNote, strainNote, disclaimer].filter(Boolean).join('\n\n')
    : [rangeNote, strainNote, disclaimer].filter(Boolean).join('\n\n');

  const _insight = {
    title: __lang === 'en' ? 'Your probiotic CFU range' : 'Tu rango de UFC diarias',
    text: __lang === 'en'
      ? `Based on your age group and health goal, the clinical literature suggests **${minLabel} – ${maxLabel} CFU/day**. ${strainNote}`
      : `Según tu grupo etario y objetivo de salud, la literatura clínica sugiere **${minLabel} – ${maxLabel} UFC/día**. ${strainNote}`,
    tone: isInfant ? 'warning' : 'info',
    icon: '🦠',
  };

  return {
    resultado: __lang === 'en' ? resultadoEn : resultado,
    resumen,
    _insight,
  };
}
