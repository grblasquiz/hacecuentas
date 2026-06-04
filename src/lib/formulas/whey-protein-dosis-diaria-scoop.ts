export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Real formula: Daily whey protein scoops
 *
 * Step 1: Daily protein target (g) = body weight (kg) × protein rate (g/kg)
 *   - Based on goal (sedentary 0.8, maintenance 1.2, hypertrophy 1.6-2.0, cutting 2.3)
 *   Source: ISSN Position Stand — Protein and Exercise (Jäger et al., JISSN 2017)
 *   https://pubmed.ncbi.nlm.nih.gov/28642676/
 *
 * Step 2: Protein deficit (g) = target − food protein already consumed
 *
 * Step 3: Daily scoops = max(0, deficit) ÷ protein per scoop
 */
export function wheyProteinDosisDiariaScoop(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const pesoKg = Number(i.peso_kg) || 0;
  const objetivo = String(i.objetivo || 'hipertrofia');
  const proteina_dieta = Number(i.proteina_dieta) >= 0 ? Number(i.proteina_dieta) : 0;
  const proteina_scoop = Number(i.proteina_scoop) > 0 ? Number(i.proteina_scoop) : 25;

  // ISSN 2017 protein rate (g/kg/day) by goal
  const rateMap: Record<string, number> = {
    sedentario:   0.8,   // OMS: sedentary adults
    mantenimiento: 1.2,  // ISSN: active, maintenance
    hipertrofia:  1.8,   // ISSN: 1.4-2.0 g/kg, mid-point for hypertrophy
    volumen:      2.0,   // ISSN: upper range for bulking
    definicion:   2.3,   // ISSN: 2.3-3.1 g/kg in hypocaloric phases
  };
  const tasa = rateMap[objetivo] ?? 1.8;

  const targetProteina = pesoKg * tasa;
  const deficit = targetProteina - proteina_dieta;
  const scoopsRaw = deficit > 0 ? deficit / proteina_scoop : 0;
  const scoops = Math.max(0, scoopsRaw);

  // Labels per language
  const goalLabels: Record<string, Record<string, string>> = {
    sedentario:    { es: 'sedentario/a (0,8 g/kg)',       en: 'sedentary (0.8 g/kg)' },
    mantenimiento: { es: 'mantenimiento (1,2 g/kg)',      en: 'maintenance (1.2 g/kg)' },
    hipertrofia:   { es: 'hipertrofia (1,8 g/kg)',        en: 'hypertrophy (1.8 g/kg)' },
    volumen:       { es: 'volumen / masa (2,0 g/kg)',     en: 'lean bulk (2.0 g/kg)' },
    definicion:    { es: 'definición en déficit (2,3 g/kg)', en: 'cutting phase (2.3 g/kg)' },
  };
  const goalLabel = (goalLabels[objetivo] ?? goalLabels['hipertrofia'])[__lang];

  const fmt = (n: number) => n.toFixed(1).replace('.', __lang === 'es' ? ',' : '.');

  const resumen = __lang === 'en'
    ? `Goal: ${goalLabel}. Target protein: ${fmt(targetProteina)} g/day ` +
      `(${pesoKg} kg × ${tasa} g/kg). From food: ${fmt(proteina_dieta)} g. ` +
      `Deficit: ${deficit > 0 ? fmt(deficit) : '0.0'} g → ${fmt(scoops)} scoops/day ` +
      `(${proteina_scoop} g protein/scoop). ISSN 2017 guidelines.`
    : `Objetivo: ${goalLabel}. Proteína objetivo: ${fmt(targetProteina)} g/día ` +
      `(${pesoKg} kg × ${tasa} g/kg). De la dieta: ${fmt(proteina_dieta)} g. ` +
      `Déficit: ${deficit > 0 ? fmt(deficit) : '0,0'} g → ${fmt(scoops)} scoops/día ` +
      `(${proteina_scoop} g proteína/scoop). Fuente: ISSN 2017.`;

  let insightText: string;
  if (__lang === 'en') {
    if (scoops <= 0) {
      insightText = `Your whole-food intake already meets your daily protein target — no whey supplement needed. Keep monitoring if your diet or training load changes.`;
    } else if (scoops <= 1) {
      insightText = `**${fmt(scoops)} scoop/day** fills your protein gap. One scoop of whey (typically 24-27 g protein) is easy to fit into breakfast or post-workout. Total target: **${fmt(targetProteina)} g/day** at ${tasa} g/kg — ISSN 2017 standard for ${goalLabel}.`;
    } else if (scoops <= 3) {
      insightText = `**${fmt(scoops)} scoops/day** to hit your protein target. Spread them across meals (20-40 g per sitting maximises muscle protein synthesis). Total goal: **${fmt(targetProteina)} g/day** (${tasa} g/kg · ${pesoKg} kg). Each scoop has ${proteina_scoop} g protein.`;
    } else {
      insightText = `**${fmt(scoops)} scoops/day** is high. Consider whether your whole-food protein estimate is accurate — tracking with an app for 3 days can help. Above 3 scoops/day, whole-food protein should cover most of the gap; whey is a convenient top-up, not a meal replacement.`;
    }
  } else {
    if (scoops <= 0) {
      insightText = `Tu dieta ya cubre tu objetivo proteico diario: no necesitás suplemento de whey. Revisá si cambia tu entrenamiento o tu ingesta habitual.`;
    } else if (scoops <= 1) {
      insightText = `**${fmt(scoops)} scoop/día** cubre tu déficit proteico. Un scoop de whey (típicamente 24-27 g de proteína) es fácil de incorporar al desayuno o post-entrenamiento. Objetivo total: **${fmt(targetProteina)} g/día** a ${String(tasa).replace('.', ',')} g/kg — estándar ISSN 2017 para ${goalLabel}.`;
    } else if (scoops <= 3) {
      insightText = `**${fmt(scoops)} scoops/día** para alcanzar tu objetivo proteico. Repartirlos en varias comidas (20-40 g por ingesta maximiza la síntesis proteica muscular). Objetivo total: **${fmt(targetProteina)} g/día** (${String(tasa).replace('.', ',')} g/kg × ${pesoKg} kg). Cada scoop aporta ${proteina_scoop} g de proteína.`;
    } else {
      insightText = `**${fmt(scoops)} scoops/día** es una cantidad elevada. Verificá que tu estimación de proteína de la dieta sea precisa — registrar con una app 3 días puede ser útil. Con más de 3 scoops/día, lo ideal es que la dieta cubra la mayor parte del objetivo; el whey es un complemento, no un reemplazo de comidas.`;
    }
  }

  const _insight = {
    title: __lang === 'en' ? 'Your daily whey scoops' : 'Tus scoops diarios de whey',
    text: insightText,
    tone: 'neutral' as const,
    icon: '🥤',
  };

  return {
    resultado: scoops.toFixed(1),
    resumen,
    _insight,
  };
}
