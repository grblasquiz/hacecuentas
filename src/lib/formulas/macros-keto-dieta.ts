/**
 * Calculadora de Macros Keto (dieta cetogénica).
 * Ratios: clásica 70/25/5, alta proteína 60/35/5, terapéutica 75/20/5.
 */

export interface MacrosKetoDietaInputs {
  calorias: number;
  ratio: string;
}

export interface MacrosKetoDietaOutputs {
  grasaGramos: number;
  proteinaGramos: number;
  carbosGramos: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function macrosKetoDieta(inputs: MacrosKetoDietaInputs): MacrosKetoDietaOutputs {
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error('Ingresá calorías válidas');

  const ratios: Record<string, [number, number, number]> = {
    clasica: [0.70, 0.25, 0.05],
    'alta-proteina': [0.60, 0.35, 0.05],
    terapeutica: [0.75, 0.20, 0.05],
  };
  const [fPct, pPct, cPct] = ratios[inputs.ratio] || ratios.clasica;

  const grasa = (cal * fPct) / 9;
  const prot = (cal * pPct) / 4;
  const carbos = (cal * cPct) / 4;

  const nombreRatio = inputs.ratio === 'alta-proteina' ? 'alta en proteína (60/35/5)' : inputs.ratio === 'terapeutica' ? 'terapéutica (75/20/5)' : 'clásica (70/25/5)';
  const _insight = {
    title: 'Tu reparto keto',
    text: `En la versión ${nombreRatio}, la grasa manda con **${grasa.toFixed(0)}g** (${(fPct * 100).toFixed(0)}% de las calorías). Mantené los carbos en **${carbos.toFixed(0)}g netos** o menos para no sacarte de cetosis.`,
    tone: 'neutral' as const,
    icon: '🥑',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Grasa', value: Math.round(cal * fPct) },
      { label: 'Proteína', value: Math.round(cal * pPct) },
      { label: 'Carbos', value: Math.round(cal * cPct) },
    ],
    prefix: '',
    centerValue: `${cal} kcal`,
    centerLabel: 'por día',
    ariaLabel: `Reparto de calorías keto: ${grasa.toFixed(0)}g grasa, ${prot.toFixed(0)}g proteína y ${carbos.toFixed(0)}g carbos, total ${cal} kcal`,
  };

  return {
    grasaGramos: Number(grasa.toFixed(0)),
    proteinaGramos: Number(prot.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    resumen: `Para ${cal} kcal en keto: ${grasa.toFixed(0)}g grasa + ${prot.toFixed(0)}g proteína + ${carbos.toFixed(0)}g carbos netos/día.`,
    _insight,
    _chart,
  };
}
