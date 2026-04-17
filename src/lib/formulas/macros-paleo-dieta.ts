/**
 * Macros Paleo 30/40/30.
 */

export interface MacrosPaleoDietaInputs {
  calorias: number;
}

export interface MacrosPaleoDietaOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  resumen: string;
}

export function macrosPaleoDieta(inputs: MacrosPaleoDietaInputs): MacrosPaleoDietaOutputs {
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error('Ingresá calorías válidas');
  const prot = (cal * 0.30) / 4;
  const grasa = (cal * 0.40) / 9;
  const carbos = (cal * 0.30) / 4;
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    resumen: `Paleo ${cal} kcal: ${prot.toFixed(0)}g proteína + ${grasa.toFixed(0)}g grasa + ${carbos.toFixed(0)}g carbos.`,
  };
}
