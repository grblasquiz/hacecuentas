/**
 * AI 16:8, 2 comidas 40/60.
 */

export interface MacrosIntermitente168AyunoInputs {
  calorias: number;
}

export interface MacrosIntermitente168AyunoOutputs {
  comida1Kcal: number;
  comida2Kcal: number;
  proteinaDiaGramos: number;
  grasaDiaGramos: number;
  carbosDiaGramos: number;
  resumen: string;
}

export function macrosIntermitente168Ayuno(inputs: MacrosIntermitente168AyunoInputs): MacrosIntermitente168AyunoOutputs {
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error('Ingresá calorías válidas');
  const c1 = cal * 0.40;
  const c2 = cal * 0.60;
  const prot = (cal * 0.30) / 4;
  const grasa = (cal * 0.30) / 9;
  const carbos = (cal * 0.40) / 4;
  return {
    comida1Kcal: Number(c1.toFixed(0)),
    comida2Kcal: Number(c2.toFixed(0)),
    proteinaDiaGramos: Number(prot.toFixed(0)),
    grasaDiaGramos: Number(grasa.toFixed(0)),
    carbosDiaGramos: Number(carbos.toFixed(0)),
    resumen: `AI 16:8 ${cal} kcal: ${c1.toFixed(0)} + ${c2.toFixed(0)} kcal. Total ${prot.toFixed(0)}g prot.`,
  };
}
