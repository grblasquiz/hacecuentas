/** Barrel aging */
export interface Inputs { litrosBarril: number; intensidadDeseada: string; tipoLicor: string; __lang?: string; }
export interface Outputs { diasMinimo: number; diasMaximo: number; equivalenteAnios: string; frecuenciaProbar: string; tips: string; _insight?: any; }

export function barrelAgingTiempoWhiskey(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const L = Number(i.litrosBarril);
  const int = String(i.intensidadDeseada);
  const tipo = String(i.tipoLicor);
  if (!L || L <= 0) throw new Error(__lang === 'en' ? 'Enter barrel size' : 'Ingresá tamaño');

  // Factor vs 200L
  const factor = Math.pow(200 / L, 1 / 3);

  // Base en meses para barril 200L
  const baseMap: Record<string, number> = {
    whiskey_suave: 24, whiskey_medio: 48, whiskey_fuerte: 96,
    ron_suave: 18, ron_medio: 36, ron_fuerte: 72,
    gin_suave: 3, gin_medio: 6, gin_fuerte: 12,
    cocktail_suave: 3, cocktail_medio: 6, cocktail_fuerte: 12,
    aguardiente_suave: 12, aguardiente_medio: 24, aguardiente_fuerte: 48,
  };
  const key = `${tipo}_${int}`;
  const meses200 = baseMap[key] ?? 48;
  const meses = meses200 / factor;
  const diasMin = Math.round(meses * 30 * 0.8);
  const diasMax = Math.round(meses * 30 * 1.2);

  const equiv = __lang === 'en'
    ? `${(meses200 / 12).toFixed(1)} years in a 200L barrel`
    : `${(meses200 / 12).toFixed(1)} años en barril 200L`;

  const T = ({
    es: {
      freqSmall: 'Cada 1-2 semanas',
      freqMed: 'Cada 2-4 semanas',
      freqLarge: 'Cada 1-2 meses',
      tipsSmall: 'Micro barril: pre-remojar 48h antes. Evaporación alta (10-15% en 6 meses).',
      tipsMed: 'Mantener en lugar fresco 18-22°C. Chequear nivel mensualmente.',
      tipsLarge: 'Barril grande estándar — paciencia es la clave.',
      insightTitle: 'Tu ventana de añejado',
    },
    en: {
      freqSmall: 'Every 1-2 weeks',
      freqMed: 'Every 2-4 weeks',
      freqLarge: 'Every 1-2 months',
      tipsSmall: 'Micro barrel: pre-soak 48h before use. High evaporation (10-15% over 6 months).',
      tipsMed: 'Keep in a cool place at 18-22°C. Check level monthly.',
      tipsLarge: 'Standard large barrel — patience is the key.',
      insightTitle: 'Your aging window',
    },
  } as const)[__lang];

  let freq = '';
  if (L <= 5) freq = T.freqSmall;
  else if (L <= 20) freq = T.freqMed;
  else freq = T.freqLarge;

  let tips = '';
  if (L <= 5) tips = T.tipsSmall;
  else if (L <= 20) tips = T.tipsMed;
  else tips = T.tipsLarge;

  const insightText = __lang === 'en'
    ? `In your **${L}L barrel**, aim for **${diasMin}–${diasMax} days** (around ${(meses).toFixed(1)} months). ` +
      (L < 200
        ? `The smaller barrel has more wood contact per liter, so it ages **${factor.toFixed(1)}× faster** than a 200L cask — taste often to avoid over-oaking.`
        : `This is full-size, so flavor develops slowly — let time do the work and taste periodically.`)
    : `En tu **barril de ${L}L** apuntá a **${diasMin}–${diasMax} días** (unos ${(meses).toFixed(1)} meses). ` +
      (L < 200
        ? `Al ser chico tiene más contacto con la madera por litro, así que añeja **${factor.toFixed(1)}× más rápido** que uno de 200L — probá seguido para no pasarte de roble.`
        : `Es de tamaño estándar, así que el sabor se desarrolla lento — dejá que el tiempo haga lo suyo y probá cada tanto.`);
  const _insight = {
    title: T.insightTitle,
    text: insightText,
    tone: (L <= 5 ? 'warn' : 'neutral') as 'warn' | 'neutral',
    icon: '🥃',
  };
  return {
    diasMinimo: diasMin,
    diasMaximo: diasMax,
    equivalenteAnios: equiv,
    frecuenciaProbar: freq,
    tips,
    _insight,
  };
}
