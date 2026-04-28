export interface Inputs {
  sex: string;
  age: number;
  weight: number;
  fold1: number;
  fold2: number;
  fold3: number;
}

export interface Outputs {
  body_density: number;
  fat_percent: number;
  fat_mass: number;
  lean_mass: number;
  classification: string;
}

// Coeficientes de Jackson & Pollock (1978 hombres, 1980 mujeres)
// Conversión densidad → % grasa: ecuación de Siri (1956)

function classifyFat(fatPercent: number, sex: string): string {
  if (sex === "male") {
    if (fatPercent < 6) return "Esencial (< 6 %)";
    if (fatPercent < 14) return "Atleta (6–13 %)";
    if (fatPercent < 18) return "Fitness (14–17 %)";
    if (fatPercent < 25) return "Promedio (18–24 %)";
    return "Obesidad (≥ 25 %)";
  } else {
    if (fatPercent < 14) return "Esencial (< 14 %)";
    if (fatPercent < 21) return "Atleta (14–20 %)";
    if (fatPercent < 25) return "Fitness (21–24 %)";
    if (fatPercent < 32) return "Promedio (25–31 %)";
    return "Obesidad (≥ 32 %)";
  }
}

export function compute(i: Inputs): Outputs {
  const sex = i.sex === "female" ? "female" : "male";
  const age = Number(i.age) || 0;
  const weight = Number(i.weight) || 0;
  const fold1 = Number(i.fold1) || 0;
  const fold2 = Number(i.fold2) || 0;
  const fold3 = Number(i.fold3) || 0;

  const defaultOut: Outputs = {
    body_density: 0,
    fat_percent: 0,
    fat_mass: 0,
    lean_mass: 0,
    classification: "Ingresa valores válidos para obtener el resultado.",
  };

  if (age <= 0 || age > 120) return defaultOut;
  if (weight <= 0 || weight > 500) return defaultOut;
  if (fold1 <= 0 || fold2 <= 0 || fold3 <= 0) return defaultOut;

  const S3 = fold1 + fold2 + fold3;
  const S3sq = S3 * S3;

  let density: number;

  if (sex === "male") {
    // Jackson & Pollock (1978) — hombres: pectoral + abdominal + muslo
    // Density = 1.10938 − (0.0008267 × S3) + (0.0000016 × S3²) − (0.0002574 × edad)
    density =
      1.10938 -
      0.0008267 * S3 +
      0.0000016 * S3sq -
      0.0002574 * age;
  } else {
    // Jackson, Pollock & Ward (1980) — mujeres: tríceps + suprailíaco + muslo
    // Density = 1.099492 − (0.0009929 × S3) + (0.0000023 × S3²) − (0.0001392 × edad)
    density =
      1.099492 -
      0.0009929 * S3 +
      0.0000023 * S3sq -
      0.0001392 * age;
  }

  if (density <= 0 || density > 1.2) {
    return {
      ...defaultOut,
      classification: "Los valores ingresados producen una densidad fuera de rango. Verifica las mediciones.",
    };
  }

  // Ecuación de Siri (1956): % grasa = ((4.95 / densidad) − 4.50) × 100
  const fatPercent = ((4.95 / density) - 4.50) * 100;

  if (fatPercent < 0 || fatPercent > 70) {
    return {
      ...defaultOut,
      classification: "El porcentaje calculado está fuera de rango. Verifica las mediciones.",
    };
  }

  const fatMass = weight * (fatPercent / 100);
  const leanMass = weight - fatMass;
  const classification = classifyFat(fatPercent, sex);

  return {
    body_density: Math.round(density * 1000000) / 1000000,
    fat_percent: Math.round(fatPercent * 10) / 10,
    fat_mass: Math.round(fatMass * 10) / 10,
    lean_mass: Math.round(leanMass * 10) / 10,
    classification,
  };
}
