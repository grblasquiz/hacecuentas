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
  _insight?: any;
}

export function yodoDiarioEmbarazo(inputs: YodoDiarioEmbarazoInputs): YodoDiarioEmbarazoOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const e = inputs.estado || 'adulto';
  const dosis: Record<string, number> = { adulto: 150, embarazo: 220, lactancia: 290, nino: 90 };
  const y = dosis[e] ?? 150;
  const T = ({
    es: {
      fuentesSugeridas: 'Sal yodada (1g=30mcg) + pescado de mar + lácteos + huevos',
      estados: { adulto: 'adulto', embarazo: 'embarazo', lactancia: 'lactancia', nino: 'niño/a' } as Record<string, string>,
      title: 'Tu objetivo de yodo',
      salGramos: (g: number) => `Equivale al yodo de unos **${g} g de sal yodada** por día (o cubrilo con pescado de mar, lácteos y huevos).`,
      extra: 'En embarazo y lactancia la demanda sube para el desarrollo neurológico del bebé — suele hacer falta un suplemento prenatal con yodo.',
    },
    en: {
      fuentesSugeridas: 'Iodized salt (1g=30mcg) + seafood + dairy + eggs',
      estados: { adulto: 'adult', embarazo: 'pregnancy', lactancia: 'breastfeeding', nino: 'child' } as Record<string, string>,
      title: 'Your iodine target',
      salGramos: (g: number) => `That's the iodine in about **${g} g of iodized salt** per day (or cover it with sea fish, dairy and eggs).`,
      extra: 'During pregnancy and breastfeeding the need rises for the baby’s brain development — a prenatal supplement with iodine is usually needed.',
    },
  } as const)[__lang];
  const estadoLabel = T.estados[e] ?? e;
  const salG = Math.round((y / 30) * 10) / 10; // 1 g sal yodada = 30 mcg
  const critico = e === 'embarazo' || e === 'lactancia';
  const insightText = __lang === 'en'
    ? `For **${estadoLabel}**, the recommended intake is **${y} mcg of iodine per day**. ${T.salGramos(salG)}${critico ? ' ' + T.extra : ''}`
    : `Para **${estadoLabel}**, la ingesta recomendada es de **${y} mcg de yodo por día**. ${T.salGramos(salG)}${critico ? ' ' + T.extra : ''}`;
  return {
    yodoMcg: y,
    fuentesSugeridas: T.fuentesSugeridas,
    resumen: __lang === 'en' ? `Your goal: ${y} mcg iodine/day.` : `Tu objetivo: ${y} mcg yodo/día.`,
    _insight: {
      title: T.title,
      text: insightText,
      tone: critico ? 'warn' : 'neutral',
      icon: '🧂',
    },
  };
}
