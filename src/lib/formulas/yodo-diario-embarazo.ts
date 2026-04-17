/**
 * Yodo RDA.
 */

export interface YodoDiarioEmbarazoInputs {
  estado: string;
}

export interface YodoDiarioEmbarazoOutputs {
  yodoMcg: number;
  fuentesSugeridas: string;
  resumen: string;
}

export function yodoDiarioEmbarazo(inputs: YodoDiarioEmbarazoInputs): YodoDiarioEmbarazoOutputs {
  const e = inputs.estado || 'adulto';
  const dosis: Record<string, number> = { adulto: 150, embarazo: 220, lactancia: 290, nino: 90 };
  const y = dosis[e] ?? 150;
  return {
    yodoMcg: y,
    fuentesSugeridas: 'Sal yodada (1g=30mcg) + pescado de mar + lácteos + huevos',
    resumen: `Tu objetivo: ${y} mcg yodo/día.`,
  };
}
