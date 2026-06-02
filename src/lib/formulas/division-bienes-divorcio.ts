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
  _insight?: any;
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

  const tuParteR = Math.round(tuParte);
  const parteOtroR = Math.round(parteOtro);
  const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('es-AR');
  const insightText = tuParteR < 0
    ? `Tu liquidación final da **negativa (−${fmt(tuParteR)})**: tu mitad de deudas supera lo que recibís por gananciales y bienes propios. En la práctica significa que te quedás haciéndote cargo de deuda neta.`
    : `Te corresponden **${fmt(tuParteR)}**: la mitad de los gananciales (${fmt(gananciales50)}) más tus bienes propios, menos tu mitad de las deudas (${fmt(deudaCadaUno)}). Los bienes propios no se reparten, por eso tu parte y la del otro cónyuge difieren según quién traía más patrimonio propio.`;

  return {
    tuParte: tuParteR,
    parteOtro: parteOtroR,
    gananciales50: Math.round(gananciales50),
    deudaCadaUno: Math.round(deudaCadaUno),
    _insight: {
      title: 'Cómo queda tu parte',
      text: insightText,
      tone: tuParteR < 0 ? 'warn' : 'neutral',
      icon: '⚖️',
    },
  };
}
