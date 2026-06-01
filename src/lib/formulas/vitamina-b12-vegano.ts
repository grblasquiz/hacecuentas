/**
 * B12 vegano.
 */

export interface VitaminaB12VeganoInputs {
  frecuencia: string;
  estado: string;
  __lang?: string;
}

export interface VitaminaB12VeganoOutputs {
  b12Mcg: number;
  forma: string;
  resumen: string;
}

export function vitaminaB12Vegano(inputs: VitaminaB12VeganoInputs): VitaminaB12VeganoOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      forma: 'Cianocobalamina sublingual o masticable con comida',
      frecSemanal: 'una vez/semana',
      frecDiaria: 'al día',
    },
    en: {
      forma: 'Sublingual or chewable cyanocobalamin with food',
      frecSemanal: 'once/week',
      frecDiaria: 'per day',
    },
  } as const)[__lang];
  const fr = inputs.frecuencia || 'diaria';
  const e = inputs.estado || 'adulto';
  let d: number;
  if (fr === 'semanal') d = 2000;
  else d = e === 'mayor' ? 500 : 250;
  const frecLabel = fr === 'semanal' ? T.frecSemanal : T.frecDiaria;
  const resumen = __lang === 'en'
    ? `Take ${d} mcg ${frecLabel}.`
    : `Tomá ${d} mcg ${frecLabel}.`;
  return {
    b12Mcg: d,
    forma: T.forma,
    resumen,
  };
}
