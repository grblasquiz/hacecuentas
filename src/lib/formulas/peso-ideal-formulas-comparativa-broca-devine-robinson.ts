export interface Inputs {
  height_cm: number;
  sex: string;
  current_weight: number | null;
}

export interface Outputs {
  broca_weight: number;
  devine_weight: number;
  robinson_weight: number;
  hamwi_weight: number;
  average_weight: number;
  acceptable_range: string;
  imc_comparison: string;
}

export function compute(i: Inputs): Outputs {
  const heightCm = Number(i.height_cm) || 0;
  const sex = i.sex || 'male';
  const currentWeight = i.current_weight ? Number(i.current_weight) : null;

  // Validaciones
  if (heightCm <= 0 || heightCm > 300) {
    return {
      broca_weight: 0,
      devine_weight: 0,
      robinson_weight: 0,
      hamwi_weight: 0,
      average_weight: 0,
      acceptable_range: 'Altura no válida (debe estar entre 1 y 300 cm)',
      imc_comparison: ''
    };
  }

  // Conversión a pulgadas (1 cm = 0.393701 pulgadas)
  const heightInches = heightCm * 0.393701;

  // Fórmula Broca: Altura (cm) − 100
  const brocaWeight = heightCm - 100;

  // Fórmula Devine
  let devineWeight: number;
  if (sex === 'male') {
    devineWeight = 50 + 2.3 * (heightInches - 60);
  } else {
    devineWeight = 45.5 + 2.3 * (heightInches - 60);
  }

  // Fórmula Robinson
  let robinsonWeight: number;
  if (sex === 'male') {
    robinsonWeight = 52 + 1.9 * (heightInches - 60);
  } else {
    robinsonWeight = 49 + 1.7 * (heightInches - 60);
  }

  // Fórmula Hamwi
  let hamwiWeight: number;
  if (sex === 'male') {
    hamwiWeight = 48 + 2.7 * (heightInches - 60);
  } else {
    hamwiWeight = 45.5 + 2.2 * (heightInches - 60);
  }

  // Promedio de las 4 fórmulas
  const averageWeight = (brocaWeight + devineWeight + robinsonWeight + hamwiWeight) / 4;

  // Rango aceptable ±10%
  const lowerRange = averageWeight * 0.9;
  const upperRange = averageWeight * 1.1;
  const acceptableRange = `${lowerRange.toFixed(1)} − ${upperRange.toFixed(1)} kg`;

  // Comparativa IMC si hay peso actual
  let imcComparison = '';
  if (currentWeight !== null && currentWeight > 0) {
    const heightM = heightCm / 100;
    const imc = currentWeight / (heightM * heightM);
    const imcCategory = imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Normal' : imc < 30 ? 'Sobrepeso' : 'Obesidad';
    const diffFromAvg = currentWeight - averageWeight;
    const diffStr = diffFromAvg > 0 ? `+${diffFromAvg.toFixed(1)}` : `${diffFromAvg.toFixed(1)}`;
    imcComparison = `Tu IMC actual: ${imc.toFixed(1)} (${imcCategory}). Diferencia respecto promedio: ${diffStr} kg. ${currentWeight >= lowerRange && currentWeight <= upperRange ? 'Dentro del rango aceptable.' : 'Fuera del rango aceptable.'}`;
  }

  return {
    broca_weight: parseFloat(brocaWeight.toFixed(1)),
    devine_weight: parseFloat(devineWeight.toFixed(1)),
    robinson_weight: parseFloat(robinsonWeight.toFixed(1)),
    hamwi_weight: parseFloat(hamwiWeight.toFixed(1)),
    average_weight: parseFloat(averageWeight.toFixed(1)),
    acceptable_range: acceptableRange,
    imc_comparison: imcComparison
  };
}
