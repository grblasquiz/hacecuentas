export interface Inputs {
  height_feet: number;
  height_inches: number;
  current_weight: number;
  frame_size: string;
  age?: number;
}

export interface Outputs {
  divine_weight: number;
  robinson_weight: number;
  hamwi_weight: number;
  average_weight: number;
  weight_range: string;
  current_bmi: number;
  ideal_bmi: string;
  weight_difference: number;
  status: string;
}

export function compute(i: Inputs): Outputs {
  const heightFeet = Number(i.height_feet) || 0;
  const heightInches = Number(i.height_inches) || 0;
  const currentWeight = Number(i.current_weight) || 0;
  const frameSize = String(i.frame_size).toLowerCase() || "medium";

  if (heightFeet <= 0 || heightInches < 0 || currentWeight <= 0) {
    return {
      divine_weight: 0,
      robinson_weight: 0,
      hamwi_weight: 0,
      average_weight: 0,
      weight_range: "Invalid input",
      current_bmi: 0,
      ideal_bmi: "N/A",
      weight_difference: 0,
      status: "Enter valid measurements"
    };
  }

  const totalInches = heightFeet * 12 + heightInches;

  // Devine formula: 100 + 5 * (height_inches - 60)
  let devineBase = 100 + 5 * (totalInches - 60);

  // Robinson formula: 49 + 1.7 * (height_inches - 60)
  let robinsonBase = 49 + 1.7 * (totalInches - 60);

  // Hamwi formula: 45.5 + 2.2 * (height_inches - 60)
  let hamwiBase = 45.5 + 2.2 * (totalInches - 60);

  // Frame size adjustments: ±10%
  const frameAdjustment = frameSize === "small" ? 0.9 : frameSize === "large" ? 1.1 : 1.0;

  const devineWeight = Math.round(devineBase * frameAdjustment * 10) / 10;
  const robinsonWeight = Math.round(robinsonBase * frameAdjustment * 10) / 10;
  const hamwiWeight = Math.round(hamwiBase * frameAdjustment * 10) / 10;

  const averageWeight = Math.round((devineWeight + robinsonWeight + hamwiWeight) / 3 * 10) / 10;

  const minRange = Math.round(averageWeight * 0.95);
  const maxRange = Math.round(averageWeight * 1.05);
  const weightRange = minRange + " - " + maxRange + " lb";

  // Calculate current BMI: weight (lb) / (height (inches) * 0.0254)^2
  const heightMeters = totalInches * 0.0254;
  const currentBMI = Math.round((currentWeight / (heightMeters * heightMeters)) * 10) / 10;

  // Ideal BMI range (18.5 - 24.9)
  const minIdealBMI = 18.5;
  const maxIdealBMI = 24.9;
  const minIdealWeight = Math.round(minIdealBMI * (heightMeters * heightMeters));
  const maxIdealWeight = Math.round(maxIdealBMI * (heightMeters * heightMeters));
  const idealBMI = "18.5 - 24.9 (" + minIdealWeight + " - " + maxIdealWeight + " lb)";

  // Weight difference from average
  const weightDifference = Math.round((currentWeight - averageWeight) * 10) / 10;

  // Status based on current BMI
  let status = "";
  if (currentBMI < 18.5) {
    status = "Underweight (BMI < 18.5)";
  } else if (currentBMI >= 18.5 && currentBMI < 25.0) {
    status = "Normal weight (BMI 18.5–24.9)";
  } else if (currentBMI >= 25.0 && currentBMI < 30.0) {
    status = "Overweight (BMI 25.0–29.9)";
  } else {
    status = "Obese (BMI ≥ 30.0)";
  }

  return {
    divine_weight: devineWeight,
    robinson_weight: robinsonWeight,
    hamwi_weight: hamwiWeight,
    average_weight: averageWeight,
    weight_range: weightRange,
    current_bmi: currentBMI,
    ideal_bmi: idealBMI,
    weight_difference: weightDifference,
    status: status
  };
}
