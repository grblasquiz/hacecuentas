export interface Inputs {
  weight_kg: number;
  exercise_hours: number;
  climate: string;
  special_condition: string;
}

export interface Outputs {
  liters_per_day: number;
  glasses_per_day: number;
  bottles_per_day: number;
  breakdown: string;
}

// Constantes basadas en recomendaciones OMS / IOM (2004-2006)
const BASE_ML_PER_KG = 35;          // ml por kg de peso corporal (OMS)
const EXERCISE_ML_PER_HOUR = 625;   // promedio de 500-750 ml/h (IOM 2004)
const HOT_CLIMATE_EXTRA_ML = 500;   // extra por clima >25°C (OMS)
const PREGNANCY_EXTRA_ML = 300;     // extra durante embarazo (OMS/IOM)
const BREASTFEEDING_EXTRA_ML = 700; // extra durante lactancia (OMS/IOM)
const GLASS_ML = 250;               // volumen estándar de un vaso
const BOTTLE_ML = 500;              // volumen estándar de una botellita

export function compute(i: Inputs): Outputs {
  const weight = Number(i.weight_kg) || 0;
  const exerciseHours = Number(i.exercise_hours) || 0;

  if (weight <= 0) {
    return {
      liters_per_day: 0,
      glasses_per_day: 0,
      bottles_per_day: 0,
      breakdown: "Ingresa un peso corporal válido para calcular."
    };
  }

  if (exerciseHours < 0) {
    return {
      liters_per_day: 0,
      glasses_per_day: 0,
      bottles_per_day: 0,
      breakdown: "Las horas de ejercicio no pueden ser negativas."
    };
  }

  // 1. Necesidad basal
  const baseMl = weight * BASE_ML_PER_KG;

  // 2. Aporte por ejercicio
  const exerciseMl = exerciseHours * EXERCISE_ML_PER_HOUR;

  // 3. Aporte por clima caluroso
  const climateMl = i.climate === "hot" ? HOT_CLIMATE_EXTRA_ML : 0;

  // 4. Aporte por condición especial
  let specialMl = 0;
  let specialLabel = "";
  if (i.special_condition === "pregnant") {
    specialMl = PREGNANCY_EXTRA_ML;
    specialLabel = `Embarazo: +${PREGNANCY_EXTRA_ML} ml`;
  } else if (i.special_condition === "breastfeeding") {
    specialMl = BREASTFEEDING_EXTRA_ML;
    specialLabel = `Lactancia: +${BREASTFEEDING_EXTRA_ML} ml`;
  }

  const totalMl = baseMl + exerciseMl + climateMl + specialMl;
  const liters = Math.round(totalMl) / 1000;
  const glasses = Math.round(totalMl / GLASS_ML);
  const bottles = Math.round((totalMl / BOTTLE_ML) * 10) / 10;

  // Construir desglose textual
  const lines: string[] = [];
  lines.push(`Base (${weight} kg × ${BASE_ML_PER_KG} ml/kg): ${baseMl.toFixed(0)} ml`);
  if (exerciseMl > 0) {
    lines.push(`Ejercicio (${exerciseHours} h × ${EXERCISE_ML_PER_HOUR} ml/h): +${exerciseMl.toFixed(0)} ml`);
  }
  if (climateMl > 0) {
    lines.push(`Clima caluroso: +${climateMl} ml`);
  }
  if (specialMl > 0 && specialLabel) {
    lines.push(specialLabel);
  }
  lines.push(`Total: ${totalMl.toFixed(0)} ml ≈ ${liters.toFixed(2)} L/día`);

  return {
    liters_per_day: Math.round(liters * 100) / 100,
    glasses_per_day: glasses,
    bottles_per_day: bottles,
    breakdown: lines.join(" | ")
  };
}
