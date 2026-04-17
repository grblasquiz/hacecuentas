/**
 * DASH 18/27/55 + sodio <2300mg.
 */

export interface MacrosDashHipertensionInputs {
  calorias: number;
}

export interface MacrosDashHipertensionOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  sodioMaxMg: number;
  resumen: string;
}

export function macrosDashHipertension(inputs: MacrosDashHipertensionInputs): MacrosDashHipertensionOutputs {
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error('Ingresá calorías válidas');
  const prot = (cal * 0.18) / 4;
  const grasa = (cal * 0.27) / 9;
  const carbos = (cal * 0.55) / 4;
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    sodioMaxMg: 2300,
    resumen: `DASH ${cal} kcal: ${prot.toFixed(0)}g prot + ${grasa.toFixed(0)}g grasa + ${carbos.toFixed(0)}g carbos + sodio <2300 mg.`,
  };
}
