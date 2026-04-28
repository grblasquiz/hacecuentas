export interface Inputs {
  weight_kg: number;
  height_cm: number;
}

export interface Outputs {
  imc: number;
  category: string;
  ideal_weight_range: string;
  weight_to_normal: string;
}

// Umbrales de categoría IMC según OMS (vigentes 2026)
// Fuente: https://www.who.int/es/news-room/fact-sheets/detail/obesity-and-overweight
const IMC_UNDERWEIGHT = 18.5;
const IMC_NORMAL_MAX = 24.9;
const IMC_OVERWEIGHT_MAX = 29.9;
const IMC_OBESITY_I_MAX = 34.9;
const IMC_OBESITY_II_MAX = 39.9;

function getCategory(imc: number): string {
  if (imc < IMC_UNDERWEIGHT) return "Bajo peso";
  if (imc <= IMC_NORMAL_MAX) return "Peso normal";
  if (imc <= IMC_OVERWEIGHT_MAX) return "Sobrepeso";
  if (imc <= IMC_OBESITY_I_MAX) return "Obesidad grado I";
  if (imc <= IMC_OBESITY_II_MAX) return "Obesidad grado II";
  return "Obesidad grado III (mórbida)";
}

export function compute(i: Inputs): Outputs {
  const weight = Number(i.weight_kg) || 0;
  const heightCm = Number(i.height_cm) || 0;

  if (weight <= 0 || heightCm <= 0) {
    return {
      imc: 0,
      category: "Ingresa valores válidos de peso y altura",
      ideal_weight_range: "—",
      weight_to_normal: "—",
    };
  }

  const heightM = heightCm / 100;
  const heightM2 = heightM * heightM;

  const imc = weight / heightM2;
  const imcRounded = Math.round(imc * 10) / 10;

  const category = getCategory(imc);

  // Rango de peso normal: IMC entre 18.5 y 24.9 para la altura dada
  const minNormal = IMC_UNDERWEIGHT * heightM2;
  const maxNormal = IMC_NORMAL_MAX * heightM2;
  const ideal_weight_range = `${minNormal.toFixed(1)} kg – ${maxNormal.toFixed(1)} kg`;

  // Diferencia para alcanzar el rango normal
  let weight_to_normal: string;
  if (imc >= IMC_UNDERWEIGHT && imc <= IMC_NORMAL_MAX) {
    weight_to_normal = "Ya estás en el rango de peso normal.";
  } else if (imc < IMC_UNDERWEIGHT) {
    const diff = minNormal - weight;
    weight_to_normal = `Necesitas ganar aproximadamente ${diff.toFixed(1)} kg para alcanzar el peso normal.`;
  } else {
    const diff = weight - maxNormal;
    weight_to_normal = `Necesitas perder aproximadamente ${diff.toFixed(1)} kg para alcanzar el peso normal.`;
  }

  return {
    imc: imcRounded,
    category,
    ideal_weight_range,
    weight_to_normal,
  };
}
