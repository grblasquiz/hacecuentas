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
}

export function zincDiarioNecesidad(inputs: ZincDiarioNecesidadInputs): ZincDiarioNecesidadOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      alimentosSugeridos: 'Ostras, carne roja, semillas calabaza, garbanzos, anacardos',
    },
    en: {
      alimentosSugeridos: 'Oysters, red meat, pumpkin seeds, chickpeas, cashews',
    },
  } as const)[__lang];
  const sexo = inputs.sexo || 'mujer';
  const emb = inputs.embarazo || 'no';
  const dieta = inputs.dieta || 'omnivoro';
  let base: number;
  if (emb === 'embarazo') base = 11;
  else if (emb === 'lactancia') base = 12;
  else base = sexo === 'hombre' ? 11 : 8;
  const zn = dieta === 'vegetariano' ? base * 1.5 : base;
  return {
    zincMg: Number(zn.toFixed(1)),
    alimentosSugeridos: T.alimentosSugeridos,
    resumen: __lang === 'en'
      ? `Your RDA: ${zn.toFixed(1)} mg zinc/day.`
      : `Tu RDA: ${zn.toFixed(1)} mg zinc/día.`,
  };
}
