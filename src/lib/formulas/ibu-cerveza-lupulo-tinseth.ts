/** IBU Tinseth 1997 */
export interface Inputs { gramosLupulo: number; alfaAcidos: number; tiempoHervor: number; volumenHervor: number; ogMosto: number; __lang?: string; }
export interface Outputs { ibu: number; utilizacion: number; clasificacion: string; }

export function ibuCervezaLupuloTinseth(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errGramos: 'Ingresá gramos de lúpulo',
      errAlfa: 'Ingresá alfa ácidos',
      errVolumen: 'Ingresá volumen',
      errOg: 'Ingresá OG válida',
      c0: 'Muy suave (lager ligera)',
      c1: 'Suave (Pilsner, Kölsch)',
      c2: 'Moderado (Pale Ale)',
      c3: 'Amargo (IPA)',
      c4: 'Muy amargo (Double IPA)',
      c5: 'Extremo (Imperial IPA)',
    },
    en: {
      errGramos: 'Enter hops weight in grams',
      errAlfa: 'Enter alpha acids percentage',
      errVolumen: 'Enter boil volume',
      errOg: 'Enter a valid OG',
      c0: 'Very mild (light lager)',
      c1: 'Mild (Pilsner, Kölsch)',
      c2: 'Moderate (Pale Ale)',
      c3: 'Bitter (IPA)',
      c4: 'Very bitter (Double IPA)',
      c5: 'Extreme (Imperial IPA)',
    },
  } as const)[__lang];

  const g = Number(i.gramosLupulo);
  const aa = Number(i.alfaAcidos);
  const t = Number(i.tiempoHervor);
  const v = Number(i.volumenHervor);
  const og = Number(i.ogMosto);
  if (!g || g <= 0) throw new Error(T.errGramos);
  if (!aa || aa <= 0) throw new Error(T.errAlfa);
  if (!v || v <= 0) throw new Error(T.errVolumen);
  if (!og || og < 1) throw new Error(T.errOg);

  const factorDensidad = 1.65 * Math.pow(0.000125, og - 1);
  const factorTiempo = (1 - Math.exp(-0.04 * t)) / 4.15;
  const utilizacion = factorDensidad * factorTiempo;
  const ibu = (utilizacion * aa * g * 1000) / (v * 100);

  let clasificacion = '';
  if (ibu < 15) clasificacion = T.c0;
  else if (ibu < 30) clasificacion = T.c1;
  else if (ibu < 45) clasificacion = T.c2;
  else if (ibu < 70) clasificacion = T.c3;
  else if (ibu < 100) clasificacion = T.c4;
  else clasificacion = T.c5;

  return {
    ibu: Number(ibu.toFixed(1)),
    utilizacion: Number((utilizacion * 100).toFixed(1)),
    clasificacion,
  };
}
