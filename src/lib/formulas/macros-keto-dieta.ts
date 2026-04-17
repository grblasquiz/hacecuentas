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

  return {
    grasaGramos: Number(grasa.toFixed(0)),
    proteinaGramos: Number(prot.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    resumen: `Para ${cal} kcal en keto: ${grasa.toFixed(0)}g grasa + ${prot.toFixed(0)}g proteína + ${carbos.toFixed(0)}g carbos netos/día.`,
  };
}
