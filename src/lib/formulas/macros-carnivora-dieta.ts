/**
 * Carnívora 30/70/0.
 */

export interface MacrosCarnivoraDietaInputs {
  calorias: number;
  __lang?: string;
}

export interface MacrosCarnivoraDietaOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  resumen: string;
}

export function macrosCarnivoraDieta(inputs: MacrosCarnivoraDietaInputs): MacrosCarnivoraDietaOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(
    __lang === 'en' ? 'Enter valid calories' : 'Ingresá calorías válidas'
  );
  const prot = (cal * 0.30) / 4;
  const grasa = (cal * 0.70) / 9;
  const resumen = __lang === 'en'
    ? `Carnivore ${cal} kcal: ${prot.toFixed(0)}g protein + ${grasa.toFixed(0)}g fat. Zero carbs. Medical supervision required.`
    : `Carnívora ${cal} kcal: ${prot.toFixed(0)}g prot + ${grasa.toFixed(0)}g grasa. Cero carbos. Supervisión médica.`;
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    resumen,
  };
}
