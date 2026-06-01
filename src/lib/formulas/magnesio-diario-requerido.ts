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
  };
}
