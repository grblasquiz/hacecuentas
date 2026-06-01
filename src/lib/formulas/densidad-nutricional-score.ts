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
  _insight?: any;
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

  // Mayor penalizador (mismas unidades que en 'negativos')
  const penalizadores = [
    { nombre: 'azúcar añadido', peso: azu },
    { nombre: 'sodio', peso: sodio / 100 },
    { nombre: 'grasa saturada', peso: gsat * 3 },
  ].sort((a, b) => b.peso - a.peso);
  const peor = penalizadores[0];
  let insightTitle: string, insightText: string, insightTone: string;
  if (scoreFinal >= 70) {
    insightTitle = `Score ${scoreFinal}/100: muy densa en nutrientes`;
    insightText = `Por cada 100 kcal este alimento aporta mucha **proteína (${prot} g)** y **fibra (${fibra} g)** frente a pocos nutrientes a limitar. Es de los que conviene priorizar en la dieta.`;
    insightTone = 'good';
  } else if (scoreFinal >= 50) {
    insightTitle = `Score ${scoreFinal}/100: densa`;
    insightText = `Buen aporte de **proteína (${prot} g)** y **fibra (${fibra} g)**, aunque el **${peor.nombre}** le resta puntos. Sólida opción; bajando ese componente sube a "muy densa".`;
    insightTone = 'neutral';
  } else if (scoreFinal >= 20) {
    insightTitle = `Score ${scoreFinal}/100: densidad moderada`;
    insightText = `El **${peor.nombre}** es lo que más penaliza frente a sus **${prot} g de proteína** y **${fibra} g de fibra**. Reducir ${peor.nombre} es la palanca más directa para mejorar el score.`;
    insightTone = 'neutral';
  } else {
    insightTitle = `Score ${scoreFinal}/100: calorías "vacías"`;
    insightText = `Aporta muchas calorías con poca proteína/fibra y demasiado **${peor.nombre}**. Conviene moderar la porción o elegir una alternativa más densa en nutrientes.`;
    insightTone = 'warn';
  }
  const insight = { title: insightTitle, text: insightText, tone: insightTone, icon: '🥗' };
  return {
    score: scoreFinal,
    clasificacion: clasif,
    nutrientesPositivos: `Proteína ${prot} g + fibra ${fibra} g`,
    nutrientesNegativos: `Azúcar ${azu} g + sodio ${sodio} mg + grasa sat ${gsat} g`,
    _chart: chart,
    _insight: insight,
  };
}
