/** Calculadora de hidratación durante ejercicio */
export interface Inputs {
  peso: number;
  duracion: number;
  intensidad: string;
  clima: string;
  __lang?: string;
}
export interface Outputs {
  mlPorHora: number;
  totalSesion: number;
  cadaCuanto: string;
  electrolitos: string;
  mensaje: string;
}

export function hidratacionEjercicioMl(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorPeso: 'Ingresá tu peso',
      cadaCuantoSuffix: 'ml cada 15-20 min',
      electrolitosSi: 'Sí — sumá electrolitos: 500-700 mg sodio/litro. Gatorade, sales de rehidratación o casero (1/4 cta sal + miel en 1L agua).',
      electrolitoNo: 'No indispensable con menos de 60 min a intensidad moderada. Agua sola alcanza.',
      mensajeSufixElectrolitos: 'Sumá electrolitos.',
      mensajeSufixAgua: 'Agua sola alcanza.',
    },
    en: {
      errorPeso: 'Enter your weight',
      cadaCuantoSuffix: 'ml every 15-20 min',
      electrolitosSi: 'Yes — add electrolytes: 500-700 mg sodium/liter. Sports drink, rehydration salts, or homemade (1/4 tsp salt + honey in 1L water).',
      electrolitoNo: 'Not necessary for sessions under 60 min at moderate intensity. Water alone is enough.',
      mensajeSufixElectrolitos: 'Add electrolytes.',
      mensajeSufixAgua: 'Water alone is enough.',
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const duracion = Number(i.duracion) || 60;
  const intensidad = String(i.intensidad || 'moderada');
  const clima = String(i.clima || 'templado');
  if (!peso || peso <= 0) throw new Error(T.errorPeso);

  // Base sweat rate ml/hr per kg
  let sudorBase: number;
  if (intensidad === 'baja') sudorBase = 6;
  else if (intensidad === 'moderada') sudorBase = 10;
  else sudorBase = 15; // alta

  // Climate factor
  let factorClima = 1.0;
  if (clima === 'frio') factorClima = 0.7;
  else if (clima === 'caluroso') factorClima = 1.3;
  else if (clima === 'humedo') factorClima = 1.5;

  let mlPorHora = Math.round(peso * sudorBase * factorClima);
  // Clamp to ACSM range
  if (mlPorHora < 300) mlPorHora = 300;
  if (mlPorHora > 1200) mlPorHora = 1200;

  const totalSesion = Math.round(mlPorHora * (duracion / 60));
  const cadaCuanto = `${Math.round(mlPorHora / 4)}-${Math.round(mlPorHora / 3)} ${T.cadaCuantoSuffix}`;

  let electrolitos: string;
  if (duracion > 60 || (clima === 'caluroso' || clima === 'humedo')) {
    electrolitos = T.electrolitosSi;
  } else {
    electrolitos = T.electrolitoNo;
  }

  return {
    mlPorHora,
    totalSesion,
    cadaCuanto,
    electrolitos,
    mensaje: __lang === 'en'
      ? `Drink ~${mlPorHora} ml/hour (${totalSesion} ml total). ${duracion > 60 ? T.mensajeSufixElectrolitos : T.mensajeSufixAgua}`
      : `Tomá ~${mlPorHora} ml/hora (${totalSesion} ml total). ${duracion > 60 ? T.mensajeSufixElectrolitos : T.mensajeSufixAgua}`,
  };
}