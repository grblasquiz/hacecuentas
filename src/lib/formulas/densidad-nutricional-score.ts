/**
 * Densidad nutricional simplificada (NRF-like).
 */

export interface DensidadNutricionalScoreInputs {
  calorias: number;
  proteina: number;
  fibra: number;
  azucarAnadido: number;
  sodio: number;
  grasaSat: number;
}

export interface DensidadNutricionalScoreOutputs {
  score: number;
  clasificacion: string;
  nutrientesPositivos: string;
  nutrientesNegativos: string;
}

export function densidadNutricionalScore(inputs: DensidadNutricionalScoreInputs): DensidadNutricionalScoreOutputs {
  const cal = Number(inputs.calorias);
  const prot = Number(inputs.proteina);
  const fibra = Number(inputs.fibra);
  const azu = Number(inputs.azucarAnadido);
  const sodio = Number(inputs.sodio);
  const gsat = Number(inputs.grasaSat);
  if (!cal || cal <= 0) throw new Error('Ingresá calorías válidas');

  const positivos = prot * 1 + fibra * 2;
  const negativos = azu + sodio / 100 + gsat * 3;
  let score = (positivos * 100) / cal - negativos;
  score = Math.max(0, Math.min(100, score));

  let clasif = '';
  if (score >= 70) clasif = 'Muy densa ✅ (nutrient-dense)';
  else if (score >= 50) clasif = 'Densa';
  else if (score >= 20) clasif = 'Moderada';
  else clasif = 'Calorie-dense ⚠️ (vacía)';

  return {
    score: Number(score.toFixed(0)),
    clasificacion: clasif,
    nutrientesPositivos: `Proteína ${prot} g + fibra ${fibra} g`,
    nutrientesNegativos: `Azúcar ${azu} g + sodio ${sodio} mg + grasa sat ${gsat} g`,
  };
}
