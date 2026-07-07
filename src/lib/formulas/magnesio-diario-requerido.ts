/**
 * Magnesio RDA.
 */

export interface MagnesioDiarioRequeridoInputs {
  sexo: string;
  edad: number;
  __lang?: string;
}

export interface MagnesioDiarioRequeridoOutputs {
  magnesioMg: number;
  suplementoSugerido: string;
  resumen: string;
  _insight?: any;
}

export function magnesioDiarioRequerido(inputs: MagnesioDiarioRequeridoInputs): MagnesioDiarioRequeridoOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorEdad: 'Ingresá edad válida',
      suplemento: 'Glicinato (sueño) o citrato (constipación). Evitar óxido.',
    },
    en: {
      errorEdad: 'Enter a valid age',
      suplemento: 'Glycinate (sleep) or citrate (constipation). Avoid oxide.',
    },
  } as const)[__lang];
  const I = ({
    es: {
      title: 'Cómo cubrir tu RDA',
      txt: (mg: number) => `Necesitás **${mg} mg de magnesio al día**. Una porción de semillas de calabaza (~30 g) aporta ~150 mg y 30 g de chocolate 70% suma ~65 mg: con dieta variada llegás sin suplementar.`,
    },
    en: {
      title: 'How to meet your RDA',
      txt: (mg: number) => `You need **${mg} mg of magnesium per day**. A serving of pumpkin seeds (~30 g) provides ~150 mg and 30 g of 70% dark chocolate adds ~65 mg: a varied diet gets you there without supplements.`,
    },
  } as const)[__lang];
  const edad = Number(inputs.edad);
  const sexo = inputs.sexo || 'mujer';
  if (!edad || edad <= 0) throw new Error(T.errorEdad);
  let mg: number;
  if (edad < 4) mg = 80;
  else if (edad < 9) mg = 130;
  else if (edad < 14) mg = 240;
  else if (edad < 19) mg = sexo === 'hombre' ? 410 : 360;
  else if (edad < 31) mg = sexo === 'hombre' ? 400 : 310;
  else mg = sexo === 'hombre' ? 420 : 320;
  return {
    magnesioMg: mg,
    suplementoSugerido: T.suplemento,
    resumen: __lang === 'en' ? `Your RDA: ${mg} mg magnesium/day.` : `Tu RDA: ${mg} mg magnesio/día.`,
    _insight: { title: I.title, text: I.txt(mg), tone: 'neutral', icon: '🥜' },
  };
}
