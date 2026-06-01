/**
 * Flexitariana 20/30/50.
 */

export interface MacrosFlexitarianaSemanaInputs {
  calorias: number;
  __lang?: string;
}

export interface MacrosFlexitarianaSemanaOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  diasVegPorSemana: number;
  resumen: string;
}

export function macrosFlexitarianaSemana(inputs: MacrosFlexitarianaSemanaInputs): MacrosFlexitarianaSemanaOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(__lang === 'en' ? 'Enter valid calories' : 'Ingresá calorías válidas');
  const prot = (cal * 0.20) / 4;
  const grasa = (cal * 0.30) / 9;
  const carbos = (cal * 0.50) / 4;
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    diasVegPorSemana: 5,
    resumen: __lang === 'en'
      ? `Flexi ${cal} kcal/day: ${prot.toFixed(0)}g protein + ${grasa.toFixed(0)}g fat + ${carbos.toFixed(0)}g carbs. 5 veggie + 2 meat days.`
      : `Flexi ${cal} kcal/día: ${prot.toFixed(0)}g prot + ${grasa.toFixed(0)}g grasa + ${carbos.toFixed(0)}g carbos. 5 veggie + 2 carne.`,
  };
}
