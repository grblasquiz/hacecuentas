// Calculadora de Proteína Diaria por Objetivo
// Factores basados en: OMS TRS-935 (2007), ISSN Position Stand (2017), ESPEN (2014)

export interface Inputs {
  weight: number;         // kg
  age_over_65: string;    // 'under_65' | 'over_65'
  goal: string;           // 'sedentary' | 'active_maintain' | 'muscle_gain' | 'fat_loss_training'
}

export interface Outputs {
  protein_min: number;    // g/día mínimo
  protein_max: number;    // g/día máximo
  protein_mid: number;    // g/día objetivo central
  food_examples: string;  // equivalencias en alimentos
}

// Factores proteicos (g/kg) por objetivo [min, max]
// Fuente: ISSN Position Stand 2017, OMS TRS-935 2007
const PROTEIN_FACTORS: Record<string, [number, number]> = {
  sedentary:          [0.8, 1.0],   // OMS mínimo recomendado
  active_maintain:    [1.2, 1.6],   // Actividad moderada / mantenimiento
  muscle_gain:        [1.6, 2.2],   // Hipertrofia muscular
  fat_loss_training:  [1.8, 2.4],   // Déficit calórico + entrenamiento de fuerza
};

// Ajuste para adultos mayores de 65 años (resistencia anabólica)
// Fuente: ESPEN Expert Group 2014 — incremento ~20%
const SENIOR_MULTIPLIER = 1.20;

// Contenido proteico de alimentos de referencia (g de proteína por 100 g de alimento)
// Fuente: USDA FoodData Central / tablas de composición nutricional
const FOOD_PROTEIN_PER_100G = {
  chicken_breast: 31,   // pechuga de pollo cocida
  tuna_canned:    26,   // atún en agua escurrido
  egg_whole:      13,   // huevo entero
  tofu_firm:      17,   // tofu firme
  lentils_cooked:  9,   // lentejas cocidas
};

function buildFoodExamples(target_g: number): string {
  if (target_g <= 0) return "Ingresa un peso válido para ver los ejemplos.";

  // Calculamos gramos de cada alimento necesarios para cubrir el objetivo
  const chicken_g = Math.round((target_g / FOOD_PROTEIN_PER_100G.chicken_breast) * 100);
  const tuna_g    = Math.round((target_g / FOOD_PROTEIN_PER_100G.tuna_canned)    * 100);
  const eggs_n    = Math.round(target_g / FOOD_PROTEIN_PER_100G.egg_whole * 100 / 55); // ~55 g/huevo
  const tofu_g    = Math.round((target_g / FOOD_PROTEIN_PER_100G.tofu_firm)      * 100);
  const lentils_g = Math.round((target_g / FOOD_PROTEIN_PER_100G.lentils_cooked) * 100);

  return (
    `Solo de una fuente: ${chicken_g} g de pechuga de pollo cocida | ` +
    `${tuna_g} g de atún en agua | ` +
    `~${eggs_n} huevos enteros | ` +
    `${tofu_g} g de tofu firme | ` +
    `${lentils_g} g de lentejas cocidas. ` +
    `Combinar fuentes es lo más práctico y nutritivo.`
  );
}

export function compute(i: Inputs): Outputs {
  const weight = Number(i.weight) || 0;

  if (weight <= 0) {
    return {
      protein_min: 0,
      protein_max: 0,
      protein_mid: 0,
      food_examples: "Ingresa tu peso corporal para calcular el objetivo proteico.",
    };
  }

  const factors = PROTEIN_FACTORS[i.goal] ?? PROTEIN_FACTORS["active_maintain"];
  const isSenior = i.age_over_65 === "over_65";
  const seniorMult = isSenior ? SENIOR_MULTIPLIER : 1.0;

  const raw_min = factors[0] * weight * seniorMult;
  const raw_max = factors[1] * weight * seniorMult;

  const protein_min = Math.round(raw_min);
  const protein_max = Math.round(raw_max);
  const protein_mid = Math.round((raw_min + raw_max) / 2);

  const food_examples = buildFoodExamples(protein_mid);

  return {
    protein_min,
    protein_max,
    protein_mid,
    food_examples,
  };
}
