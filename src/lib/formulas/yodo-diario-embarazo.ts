/**
 * Yodo RDA.
 */

export interface YodoDiarioEmbarazoInputs {
  estado: string;
  __lang?: string;
}

export interface YodoDiarioEmbarazoOutputs {
  yodoMcg: number;
  fuentesSugeridas: string;
  resumen: string;
}

export function yodoDiarioEmbarazo(inputs: YodoDiarioEmbarazoInputs): YodoDiarioEmbarazoOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const e = inputs.estado || 'adulto';
  const dosis: Record<string, number> = { adulto: 150, embarazo: 220, lactancia: 290, nino: 90 };
  const y = dosis[e] ?? 150;
  const T = ({
    es: {
      fuentesSugeridas: 'Sal yodada (1g=30mcg) + pescado de mar + lácteos + huevos',
    },
    en: {
      fuentesSugeridas: 'Iodized salt (1g=30mcg) + seafood + dairy + eggs',
    },
  } as const)[__lang];
  return {
    yodoMcg: y,
    fuentesSugeridas: T.fuentesSugeridas,
    resumen: __lang === 'en' ? `Your goal: ${y} mcg iodine/day.` : `Tu objetivo: ${y} mcg yodo/día.`,
  };
}
