/** Calculadora de proteína por comida — absorción óptima */
export interface Inputs {
  peso: number;
  proteinaDiaria: number;
  comidas: number;
  __lang?: string;
}
export interface Outputs {
  proteinaPorComida: number;
  optimo: string;
  horasEntre: number;
  aprovechamiento: string;
  mensaje: string;
}

export function proteinaPorComidaAbsorcion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errPeso: 'Ingresá tu peso',
      errProteina: 'Ingresá la proteína diaria',
      aprovOk: '✅ Distribución óptima: cada comida está en el rango ideal para síntesis muscular.',
      aprovPoco: '⚠️ Poca proteína por comida. Considerá reducir el número de comidas o aumentar la proteína total.',
      aprovExceso: '⚠️ Exceso por comida. Podrías distribuir mejor sumando 1-2 comidas más.',
    },
    en: {
      errPeso: 'Enter your weight',
      errProteina: 'Enter your daily protein',
      aprovOk: '✅ Optimal distribution: each meal is in the ideal range for muscle protein synthesis.',
      aprovPoco: '⚠️ Too little protein per meal. Consider reducing the number of meals or increasing total protein.',
      aprovExceso: '⚠️ Too much protein per meal. You could spread it better by adding 1-2 more meals.',
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const proteinaDiaria = Number(i.proteinaDiaria);
  const comidas = Number(i.comidas) || 4;
  if (!peso || peso <= 0) throw new Error(T.errPeso);
  if (!proteinaDiaria || proteinaDiaria <= 0) throw new Error(T.errProteina);

  const proteinaPorComida = Math.round(proteinaDiaria / comidas);
  const optimoMin = Math.round(peso * 0.4);
  const optimoMax = Math.round(peso * 0.55);
  const horasEntre = Math.round((16 / comidas) * 10) / 10; // horas activas

  let aprovechamiento: string;
  if (proteinaPorComida >= optimoMin && proteinaPorComida <= optimoMax) {
    aprovechamiento = T.aprovOk;
  } else if (proteinaPorComida < optimoMin) {
    aprovechamiento = T.aprovPoco;
  } else {
    aprovechamiento = T.aprovExceso;
  }

  return {
    proteinaPorComida,
    optimo: __lang === 'en'
      ? `${optimoMin}-${optimoMax} g per meal`
      : `${optimoMin}-${optimoMax} g por comida`,
    horasEntre,
    aprovechamiento,
    mensaje: __lang === 'en'
      ? `${proteinaPorComida}g per meal across ${comidas} meals. Optimal range: ${optimoMin}-${optimoMax}g. Space each meal ~${horasEntre}h apart.`
      : `${proteinaPorComida}g por comida en ${comidas} comidas. Rango óptimo: ${optimoMin}-${optimoMax}g. Separá cada comida ~${horasEntre}h.`,
  };
}