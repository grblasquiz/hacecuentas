/**
 * Calculadora de División de Bienes en Divorcio - Argentina
 * CCyCN Arts. 463-504: Gananciales 50/50, propios no se dividen
 */

export interface DivisionBienesInputs {
  bienesGananciales: number;
  bienesPropiosA: number;
  bienesPropiosB: number;
  deudas: number;
}

export interface DivisionBienesOutputs {
  tuParte: number;
  parteOtro: number;
  gananciales50: number;
  deudaCadaUno: number;
}

export function divisionBienesDivorcio(inputs: DivisionBienesInputs): DivisionBienesOutputs {
  const gananciales = Math.max(0, Number(inputs.bienesGananciales) || 0);
  const propiosA = Math.max(0, Number(inputs.bienesPropiosA) || 0);
  const propiosB = Math.max(0, Number(inputs.bienesPropiosB) || 0);
  const deudas = Math.max(0, Number(inputs.deudas) || 0);

  if (gananciales <= 0 && propiosA <= 0 && propiosB <= 0) {
    throw new Error('Ingresá al menos un tipo de bien para calcular');
  }

  const gananciales50 = gananciales / 2;
  const deudaCadaUno = deudas / 2;

  const tuParte = gananciales50 + propiosA - deudaCadaUno;
  const parteOtro = gananciales50 + propiosB - deudaCadaUno;

  return {
    tuParte: Math.round(tuParte),
    parteOtro: Math.round(parteOtro),
    gananciales50: Math.round(gananciales50),
    deudaCadaUno: Math.round(deudaCadaUno),
  };
}
