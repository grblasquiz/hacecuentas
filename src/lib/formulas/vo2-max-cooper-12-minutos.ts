export interface Inputs {
  distance: number;
  unit: string;
  sex: string;
  age: number;
}

export interface Outputs {
  vo2max: number;
  category: string;
  percentile: string;
  interpretation: string;
}

// Fórmula original de Cooper (1968): VO2max = (distancia_m - 504.9) / 44.73
// Fuente: Cooper KH. JAMA 1968;203(3):201-204
const COOPER_INTERCEPT = 504.9;
const COOPER_SLOPE = 44.73;

// Tablas de clasificación por sexo y grupo de edad
// Fuente: The Cooper Institute – Fitness Norms Reference Tables (2013)
// Estructura: [limite_superior_superior, limite_inferior_excelente, limite_inferior_bueno, limite_inferior_regular]
// Si vo2max >= superior -> "Superior"
// Si vo2max >= excelente -> "Excelente"
// Si vo2max >= bueno -> "Bueno"
// Si vo2max >= regular -> "Regular"
// else -> "Bajo"
const NORMS_MALE: Record<string, number[]> = {
  "20-29": [55.4, 51.1, 45.2, 41.0],
  "30-39": [52.5, 48.3, 43.0, 38.5],
  "40-49": [48.5, 44.5, 39.0, 35.0],
  "50-59": [45.0, 41.0, 36.0, 32.0],
  "60+":   [38.1, 35.0, 31.5, 28.0]
};

const NORMS_FEMALE: Record<string, number[]> = {
  "20-29": [49.6, 43.9, 38.6, 35.2],
  "30-39": [45.1, 39.0, 34.4, 31.5],
  "40-49": [40.0, 35.5, 30.2, 27.5],
  "50-59": [37.5, 32.3, 28.2, 25.1],
  "60+":   [32.3, 28.7, 24.5, 22.8]
};

// Percentiles aproximados por categoría (referencia general)
const PERCENTILE_MAP: Record<string, string> = {
  "Superior":  "Percentil 80 o superior",
  "Excelente": "Percentil 60–79",
  "Bueno":     "Percentil 40–59",
  "Regular":   "Percentil 20–39",
  "Bajo":      "Percentil inferior a 20"
};

const INTERPRETATION_MAP: Record<string, string> = {
  "Superior":  "Capacidad aeróbica muy por encima del promedio para tu grupo de edad y sexo. Nivel atlético o de alto rendimiento.",
  "Excelente": "Capacidad aeróbica por encima del promedio. Refleja una condición física consistentemente mantenida.",
  "Bueno":     "Capacidad aeróbica en rango saludable. Con entrenamiento regular puedes alcanzar el nivel excelente.",
  "Regular":   "Capacidad aeróbica por debajo del promedio. Se recomienda incrementar la actividad aeróbica progresivamente.",
  "Bajo":      "Capacidad aeróbica significativamente por debajo del promedio. Consulta con un profesional de salud antes de iniciar un programa de ejercicio intenso."
};

function getAgeGroup(age: number): string {
  if (age < 20) return "20-29"; // aplicar norma del grupo más joven como aproximación
  if (age <= 29) return "20-29";
  if (age <= 39) return "30-39";
  if (age <= 49) return "40-49";
  if (age <= 59) return "50-59";
  return "60+";
}

function getCategory(vo2max: number, sex: string, ageGroup: string): string {
  const norms = sex === "female" ? NORMS_FEMALE : NORMS_MALE;
  const thresholds = norms[ageGroup];
  if (!thresholds) return "Sin datos";
  const [superior, excelente, bueno, regular] = thresholds;
  if (vo2max >= superior)  return "Superior";
  if (vo2max >= excelente) return "Excelente";
  if (vo2max >= bueno)     return "Bueno";
  if (vo2max >= regular)   return "Regular";
  return "Bajo";
}

export function compute(i: Inputs): Outputs {
  const rawDistance = Number(i.distance) || 0;
  const unit = i.unit || "meters";
  const sex = i.sex || "male";
  const age = Math.round(Number(i.age) || 25);

  if (rawDistance <= 0) {
    return {
      vo2max: 0,
      category: "Ingresa una distancia válida mayor a 0",
      percentile: "—",
      interpretation: "Ingresa la distancia recorrida durante los 12 minutos del test Cooper."
    };
  }

  if (age < 10 || age > 100) {
    return {
      vo2max: 0,
      category: "Edad fuera de rango",
      percentile: "—",
      interpretation: "Ingresa una edad entre 10 y 100 años."
    };
  }

  // Convertir a metros si es necesario
  const distanceMeters = unit === "kilometers" ? rawDistance * 1000 : rawDistance;

  if (distanceMeters < 100 || distanceMeters > 6000) {
    return {
      vo2max: 0,
      category: "Distancia fuera de rango",
      percentile: "—",
      interpretation: "La distancia debe estar entre 100 m y 6000 m para una estimación válida."
    };
  }

  // Fórmula de Cooper
  const vo2max = (distanceMeters - COOPER_INTERCEPT) / COOPER_SLOPE;
  const vo2maxRounded = Math.round(vo2max * 100) / 100;

  // Clasificación
  const ageGroup = getAgeGroup(age);
  const category = getCategory(vo2maxRounded, sex, ageGroup);
  const percentile = PERCENTILE_MAP[category] || "Sin datos";
  const interpretation = INTERPRETATION_MAP[category] || "Sin interpretación disponible.";

  // Validación de resultado físicamente plausible
  if (vo2maxRounded < 5) {
    return {
      vo2max: vo2maxRounded,
      category: "Resultado muy bajo — verificar distancia",
      percentile: "—",
      interpretation: "El valor obtenido es extremadamente bajo. Verifica que la distancia ingresada corresponda a los 12 minutos completos del test."
    };
  }

  return {
    vo2max: vo2maxRounded,
    category,
    percentile,
    interpretation
  };
}
