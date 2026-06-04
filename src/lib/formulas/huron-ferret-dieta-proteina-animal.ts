export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

/**
 * Ferret Daily Diet & Protein Calculator
 *
 * Method: Daily food intake = body weight (kg) × life-stage intake factor (5–7% BW/day).
 * Minimum animal protein = daily food × minimum protein % for that life stage.
 * Sources:
 *   - VCA Animal Hospitals, "Feeding Ferrets": https://vcahospitals.com/know-your-pet/feeding-ferrets
 *   - Indiana BOAH Ferret Care Guidelines: https://www.in.gov/boah/files/Ferrets-General-Care-Guidelines.pdf
 *   - Bell JA (2000) "Ferret Nutrition" PubMed 11228691
 */
export function huronFerretDietaProteinaAnimal(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  // v1 = weight in kg, v2 = life stage (string select)
  const v1 = Number(i.v1) || 0;
  const stage = String(i.v2 || 'adult');

  // Life-stage parameters
  // intakePct: daily food as % of body weight (mid-range of veterinary guidelines)
  // minProteinPct: minimum animal protein % in diet (dry matter basis)
  // minFatPct: minimum fat % in diet
  type StageConfig = { intakePct: number; minProteinPct: number; minFatPct: number; label: string; labelPt: string; labelEs: string };
  const stages: Record<string, StageConfig> = {
    kit:       { intakePct: 0.07, minProteinPct: 35, minFatPct: 20, label: 'Kit/Juvenile (< 1 year)',        labelPt: 'Filhote/Juvenil (< 1 ano)',        labelEs: 'Cría/Juvenil (< 1 año)'        },
    adult:     { intakePct: 0.06, minProteinPct: 32, minFatPct: 15, label: 'Adult (1–3 years)',               labelPt: 'Adulto (1–3 anos)',                labelEs: 'Adulto (1–3 años)'             },
    pregnant:  { intakePct: 0.07, minProteinPct: 38, minFatPct: 20, label: 'Pregnant / Lactating',           labelPt: 'Prenha / Lactante',               labelEs: 'Gestante / Lactante'           },
    senior:    { intakePct: 0.05, minProteinPct: 30, minFatPct: 15, label: 'Senior (3+ years)',               labelPt: 'Sênior (3+ anos)',                 labelEs: 'Senior (3+ años)'              },
  };

  const cfg: StageConfig = stages[stage] || stages['adult'];

  // Daily food amount (grams) = weight_kg × 1000 × intake_pct
  const dailyFoodG = v1 * 1000 * cfg.intakePct;

  // Minimum protein grams from food = dailyFoodG × (minProteinPct / 100)
  const minProteinG = dailyFoodG * (cfg.minProteinPct / 100);

  // Minimum fat grams from food = dailyFoodG × (minFatPct / 100)
  const minFatG = dailyFoodG * (cfg.minFatPct / 100);

  // Format outputs
  const foodStr = dailyFoodG.toFixed(1);
  const proteinStr = minProteinG.toFixed(1);
  const fatStr = minFatG.toFixed(1);

  const stageLabel = __lang === 'en' ? cfg.label : __lang === 'pt' ? cfg.labelPt : cfg.labelEs;

  if (v1 <= 0) {
    const errMsg = __lang === 'en'
      ? 'Please enter a valid ferret weight.'
      : __lang === 'pt'
      ? 'Por favor insira um peso válido.'
      : 'Ingresá un peso válido.';
    return { resultado: errMsg, resumen: '', _insight: { title: '', text: errMsg, tone: 'warning', icon: '🦦' } };
  }

  let resumen: string;
  let insightText: string;

  if (__lang === 'en') {
    resumen = `Stage: ${stageLabel} | Daily food: ${foodStr} g | Min. protein: ${proteinStr} g (${cfg.minProteinPct}%) | Min. fat: ${fatStr} g (${cfg.minFatPct}%).`;
    insightText = `A **${stageLabel}** ferret weighing **${v1} kg** needs roughly **${foodStr} g of food per day** (${(cfg.intakePct * 100).toFixed(0)}% of body weight). Of that, at least **${proteinStr} g must come from animal protein** (${cfg.minProteinPct}% minimum) and **${fatStr} g from fat** (${cfg.minFatPct}% minimum). Ferrets are obligate carnivores — always choose meat-first foods with no grains or fruit fillers.`;
  } else if (__lang === 'pt') {
    resumen = `Fase: ${stageLabel} | Ração diária: ${foodStr} g | Proteína mín.: ${proteinStr} g (${cfg.minProteinPct}%) | Gordura mín.: ${fatStr} g (${cfg.minFatPct}%).`;
    insightText = `Um furão **${stageLabel}** pesando **${v1} kg** precisa de cerca de **${foodStr} g de ração por dia** (${(cfg.intakePct * 100).toFixed(0)}% do peso corporal). Desse total, pelo menos **${proteinStr} g devem vir de proteína animal** (mínimo ${cfg.minProteinPct}%) e **${fatStr} g de gordura** (mínimo ${cfg.minFatPct}%). Furões são carnívoros obrigatórios — escolha sempre alimentos à base de carne, sem grãos ou frutas.`;
  } else {
    resumen = `Etapa: ${stageLabel} | Comida diaria: ${foodStr} g | Proteína mín.: ${proteinStr} g (${cfg.minProteinPct}%) | Grasa mín.: ${fatStr} g (${cfg.minFatPct}%).`;
    insightText = `Un hurón **${stageLabel}** de **${v1} kg** necesita aproximadamente **${foodStr} g de alimento por día** (${(cfg.intakePct * 100).toFixed(0)}% del peso corporal). De eso, al menos **${proteinStr} g deben ser proteína animal** (mínimo ${cfg.minProteinPct}%) y **${fatStr} g de grasa** (mínimo ${cfg.minFatPct}%). Los hurones son carnívoros estrictos: elegí siempre alimentos con carne como primer ingrediente.`;
  }

  const insight = {
    title: __lang === 'en' ? 'Feeding Summary' : __lang === 'pt' ? 'Resumo Alimentar' : 'Resumen Alimenticio',
    text: insightText,
    tone: 'neutral',
    icon: '🦦',
  };

  // Primary output: daily food in grams (shown prominently)
  const resultado = `${foodStr} g/day`;

  return { resultado, resumen, _insight: insight };
}
