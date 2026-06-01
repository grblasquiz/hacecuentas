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
  _chart?: any;
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

  const scoreFinal = Number(score.toFixed(0));
  const chart = {
    type: 'scale' as const,
    marker: scoreFinal,
    markerLabel: 'Tu score: ' + scoreFinal,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Vacía', max: 20, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Moderada', max: 50, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Densa', max: 70, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Muy densa', max: 100, color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: 'Escala de densidad nutricional de 0 a 100',
  };

  return {
    score: scoreFinal,
    clasificacion: clasif,
    nutrientesPositivos: `Proteína ${prot} g + fibra ${fibra} g`,
    nutrientesNegativos: `Azúcar ${azu} g + sodio ${sodio} mg + grasa sat ${gsat} g`,
    _chart: chart,
  };
}
