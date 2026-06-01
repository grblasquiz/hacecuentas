/**
 * Macros Mediterránea 15/35/50.
 */

export interface MacrosMediterraneaInputs {
  calorias: number;
  __lang?: string;
}

export interface MacrosMediterraneaOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  resumen: string;
}

export function macrosMediterranea(inputs: MacrosMediterraneaInputs): MacrosMediterraneaOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(__lang === 'en' ? 'Enter valid calories' : 'Ingresá calorías válidas');
  const prot = (cal * 0.15) / 4;
  const grasa = (cal * 0.35) / 9;
  const carbos = (cal * 0.50) / 4;
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    resumen: __lang === 'en'
      ? `Mediterranean ${cal} kcal: ${prot.toFixed(0)}g protein + ${grasa.toFixed(0)}g fat (olive) + ${carbos.toFixed(0)}g whole-grain carbs.`
      : `Mediterránea ${cal} kcal: ${prot.toFixed(0)}g prot + ${grasa.toFixed(0)}g grasa (oliva) + ${carbos.toFixed(0)}g carbos integrales.`,
  };
}
