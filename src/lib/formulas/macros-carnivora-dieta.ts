/**
 * Carnívora 30/70/0.
 */

export interface MacrosCarnivoraDietaInputs {
  calorias: number;
}

export interface MacrosCarnivoraDietaOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  resumen: string;
}

export function macrosCarnivoraDieta(inputs: MacrosCarnivoraDietaInputs): MacrosCarnivoraDietaOutputs {
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error('Ingresá calorías válidas');
  const prot = (cal * 0.30) / 4;
  const grasa = (cal * 0.70) / 9;
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    resumen: `Carnívora ${cal} kcal: ${prot.toFixed(0)}g prot + ${grasa.toFixed(0)}g grasa. Cero carbos. Supervisión médica.`,
  };
}
