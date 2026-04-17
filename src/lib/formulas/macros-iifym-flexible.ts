/**
 * IIFYM 30/30/40.
 */

export interface MacrosIifymFlexibleInputs {
  calorias: number;
}

export interface MacrosIifymFlexibleOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  flexibleKcal: number;
  resumen: string;
}

export function macrosIifymFlexible(inputs: MacrosIifymFlexibleInputs): MacrosIifymFlexibleOutputs {
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error('Ingresá calorías válidas');
  const prot = (cal * 0.30) / 4;
  const grasa = (cal * 0.30) / 9;
  const carbos = (cal * 0.40) / 4;
  const flex = cal * 0.20;
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    flexibleKcal: Number(flex.toFixed(0)),
    resumen: `IIFYM ${cal} kcal: ${prot.toFixed(0)}g prot + ${grasa.toFixed(0)}g grasa + ${carbos.toFixed(0)}g carbos. ${flex.toFixed(0)} flex.`,
  };
}
