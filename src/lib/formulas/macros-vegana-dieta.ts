/**
 * Macros Vegana 20/25/55.
 */

export interface MacrosVeganaDietaInputs {
  calorias: number;
  __lang?: string;
}

export interface MacrosVeganaDietaOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  resumen: string;
}

export function macrosVeganaDieta(inputs: MacrosVeganaDietaInputs): MacrosVeganaDietaOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(__lang === 'en' ? 'Enter valid calories' : 'Ingresá calorías válidas');
  const prot = (cal * 0.20) / 4;
  const grasa = (cal * 0.25) / 9;
  const carbos = (cal * 0.55) / 4;
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    resumen: __lang === 'en'
      ? `Vegan ${cal} kcal: ${prot.toFixed(0)}g plant protein + ${grasa.toFixed(0)}g fat + ${carbos.toFixed(0)}g carbs. Supplement B12.`
      : `Vegana ${cal} kcal: ${prot.toFixed(0)}g prot vegetal + ${grasa.toFixed(0)}g grasa + ${carbos.toFixed(0)}g carbos. Suplementá B12.`,
  };
}
