/**
 * Zinc RDA.
 */

export interface ZincDiarioNecesidadInputs {
  sexo: string;
  embarazo: string;
  dieta: string;
  __lang?: string;
}

export interface ZincDiarioNecesidadOutputs {
  zincMg: number;
  alimentosSugeridos: string;
  resumen: string;
  _insight?: any;
}

export function zincDiarioNecesidad(inputs: ZincDiarioNecesidadInputs): ZincDiarioNecesidadOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      alimentosSugeridos: 'Ostras, carne roja, semillas calabaza, garbanzos, anacardos',
      insightTitle: 'Tu zinc diario recomendado',
      insightBase: (mg: string) => `Tu RDA de zinc es de **${mg} mg/día**, cubrible con alimentos como ostras, carne roja, semillas de calabaza o garbanzos.`,
      insightVeg: ' Al ser **dieta vegetariana**, se suma un **+50%** porque los fitatos de granos y legumbres reducen la absorción.',
    },
    en: {
      alimentosSugeridos: 'Oysters, red meat, pumpkin seeds, chickpeas, cashews',
      insightTitle: 'Your recommended daily zinc',
      insightBase: (mg: string) => `Your zinc RDA is **${mg} mg/day**, coverable with foods like oysters, red meat, pumpkin seeds or chickpeas.`,
      insightVeg: ' On a **vegetarian diet**, add **+50%** because phytates in grains and legumes lower absorption.',
    },
  } as const)[__lang];
  const sexo = inputs.sexo || 'mujer';
  const emb = inputs.embarazo || 'no';
  const dieta = inputs.dieta || 'omnivoro';
  let base: number;
  if (emb === 'embarazo') base = 11;
  else if (emb === 'lactancia') base = 12;
  else base = sexo === 'hombre' ? 11 : 8;
  const esVeg = dieta === 'vegetariano';
  const zn = esVeg ? base * 1.5 : base;
  const _insight = {
    title: T.insightTitle,
    text: T.insightBase(zn.toFixed(1)) + (esVeg ? T.insightVeg : ''),
    tone: 'neutral',
    icon: '🦪',
  };
  return {
    zincMg: Number(zn.toFixed(1)),
    alimentosSugeridos: T.alimentosSugeridos,
    resumen: __lang === 'en'
      ? `Your RDA: ${zn.toFixed(1)} mg zinc/day.`
      : `Tu RDA: ${zn.toFixed(1)} mg zinc/día.`,
    _insight,
  };
}
