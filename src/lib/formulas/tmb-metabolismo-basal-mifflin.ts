export interface Inputs {
  sex: string;
  weight_kg: number;
  height_cm: number;
  age_years: number;
  activity: string;
}

export interface Outputs {
  tmb_kcal: number;
  get_kcal: number;
  activity_factor_label: string;
  interpretation: string;
}

// Factores PAL según FAO/OMS/UNU (2004) y Mifflin-St Jeor (1990)
const ACTIVITY_FACTORS: Record<string, { factor: number; label: string }> = {
  sedentary: { factor: 1.2, label: "Sedentario (PAL 1.20)" },
  light:     { factor: 1.375, label: "Ligeramente activo (PAL 1.375)" },
  moderate:  { factor: 1.55, label: "Moderadamente activo (PAL 1.55)" },
  active:    { factor: 1.725, label: "Muy activo (PAL 1.725)" },
  extra:     { factor: 1.9, label: "Extremadamente activo (PAL 1.90)" },
};

export function compute(i: Inputs): Outputs {
  const weight = Number(i.weight_kg) || 0;
  const height = Number(i.height_cm) || 0;
  const age    = Number(i.age_years) || 0;
  const sex    = String(i.sex || "male").toLowerCase();
  const activity = String(i.activity || "moderate").toLowerCase();

  // Validación básica
  if (weight <= 0 || height <= 0 || age <= 0) {
    return {
      tmb_kcal: 0,
      get_kcal: 0,
      activity_factor_label: "",
      interpretation: "Ingresa valores válidos de peso, altura y edad.",
    };
  }

  if (age < 15 || age > 100) {
    return {
      tmb_kcal: 0,
      get_kcal: 0,
      activity_factor_label: "",
      interpretation: "Esta ecuación está validada para personas de 15 a 100 años. Para menores de 18 años los resultados son aproximados.",
    };
  }

  // Ecuación Mifflin-St Jeor (1990)
  // Hombres: TMB = 10·kg + 6.25·cm − 5·edad + 5
  // Mujeres: TMB = 10·kg + 6.25·cm − 5·edad − 161
  const sexConstant = sex === "female" ? -161 : 5;
  const tmb = (10 * weight) + (6.25 * height) - (5 * age) + sexConstant;

  if (tmb <= 0) {
    return {
      tmb_kcal: 0,
      get_kcal: 0,
      activity_factor_label: "",
      interpretation: "La combinación de datos ingresados produce un resultado fuera de rango. Verifica los valores.",
    };
  }

  // Factor de actividad
  const activityData = ACTIVITY_FACTORS[activity] ?? ACTIVITY_FACTORS["moderate"];
  const get = tmb * activityData.factor;

  // Interpretación básica
  let interpretation = "";
  if (get < 1200) {
    interpretation = `Tu GET estimado es muy bajo (${get.toFixed(0)} kcal/día). Consulta con un profesional de la salud antes de ajustar tu ingesta.`;
  } else if (get < 1600) {
    interpretation = `Tu GET es bajo-moderado (${get.toFixed(0)} kcal/día). Asegúrate de cubrir micronutrientes esenciales con esta ingesta.`;
  } else if (get < 2500) {
    interpretation = `Tu GET está en el rango habitual para adultos (${get.toFixed(0)} kcal/día). Ajusta tu dieta a este valor según tu objetivo.`;
  } else {
    interpretation = `Tu GET es elevado (${get.toFixed(0)} kcal/día), propio de alta actividad física. Prioriza una ingesta adecuada de proteínas e hidratos.`;
  }

  return {
    tmb_kcal: Math.round(tmb * 100) / 100,
    get_kcal: Math.round(get * 100) / 100,
    activity_factor_label: activityData.label,
    interpretation,
  };
}
