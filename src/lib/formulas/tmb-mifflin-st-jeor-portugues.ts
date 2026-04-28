export interface Inputs {
  sex: string;
  weight: number;
  height: number;
  age: number;
  activity: string;
}

export interface Outputs {
  tmb: number;
  get: number;
  deficit_cut: number;
  surplus_bulk: number;
  formula_used: string;
}

// Fatores de atividade — escala de Harris-Benedict adaptada por Ainsworth et al.
const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

// Constante de ajuste por sexo — Mifflin et al. (1990), Am J Clin Nutr
const SEX_CONSTANT: Record<string, number> = {
  male: 5,
  female: -161,
};

export function compute(i: Inputs): Outputs {
  const weight = Number(i.weight) || 0;
  const height = Number(i.height) || 0;
  const age = Number(i.age) || 0;
  const sex = i.sex || "male";
  const activity = i.activity || "sedentary";

  // Validações defensivas
  if (weight <= 0 || height <= 0 || age <= 0) {
    return {
      tmb: 0,
      get: 0,
      deficit_cut: 0,
      surplus_bulk: 0,
      formula_used: "Informe peso, altura e idade válidos para calcular.",
    };
  }

  if (weight > 500 || height > 300 || age > 120) {
    return {
      tmb: 0,
      get: 0,
      deficit_cut: 0,
      surplus_bulk: 0,
      formula_used: "Valores fora do intervalo válido. Verifique os dados informados.",
    };
  }

  const sexConstant = SEX_CONSTANT[sex] ?? SEX_CONSTANT["male"];
  const activityFactor = ACTIVITY_FACTORS[activity] ?? ACTIVITY_FACTORS["sedentary"];

  // Fórmula Mifflin-St Jeor (1990)
  // TMB = 10 × peso(kg) + 6,25 × altura(cm) − 5 × idade(anos) + constante_sexo
  const tmb = 10 * weight + 6.25 * height - 5 * age + sexConstant;

  // GET = TMB × fator de atividade
  const get = tmb * activityFactor;

  // Déficit de 20% abaixo do GET (emagrecimento moderado e seguro)
  const deficit_cut = get * 0.8;

  // Superávit de 15% acima do GET (lean bulk — ganho de massa com menor acúmulo de gordura)
  const surplus_bulk = get * 1.15;

  const sexLabel = sex === "female" ? "Feminino" : "Masculino";
  const activityLabels: Record<string, string> = {
    sedentary: "Sedentário (×1,200)",
    light: "Levemente ativo (×1,375)",
    moderate: "Moderadamente ativo (×1,550)",
    very_active: "Muito ativo (×1,725)",
    extra_active: "Extremamente ativo (×1,900)",
  };
  const activityLabel = activityLabels[activity] ?? activity;

  const formula_used =
    `Mifflin-St Jeor | ${sexLabel} | ${weight} kg, ${height} cm, ${age} anos | ` +
    `TMB = ${tmb.toFixed(1)} kcal/dia | Atividade: ${activityLabel}`;

  return {
    tmb: Math.round(tmb * 10) / 10,
    get: Math.round(get * 10) / 10,
    deficit_cut: Math.round(deficit_cut * 10) / 10,
    surplus_bulk: Math.round(surplus_bulk * 10) / 10,
    formula_used,
  };
}
