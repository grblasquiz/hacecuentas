export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function variantesIdiomaEspanolPortuguesInglesRegiones(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const id=String(i.idioma||'espanol');

  type LangPair = [string, string];
  const vEs: Record<string, LangPair> = {
    espanol:  ['Peninsular, Rioplatense, Mexicano, Andino', 'Vosotros vs Ustedes'],
    portugues:['Brasileño vs Europeo',                     'Pronunciación y léxico'],
    ingles:   ['US, UK, AUS, India',                       'Pronunciación y slang'],
    frances:  ['Metropolitano, Québécois',                 'Vocabulario y pronunciación'],
    arabe:    ['MSA + dialectos (egipcio, levantino...)',   'Dialectos pueden ser ininteligibles'],
    chino:    ['Mandarín, Cantonés, Hokkien',              'Tonos y caracteres'],
  };
  const vEn: Record<string, LangPair> = {
    espanol:  ['Peninsular, Rioplatense, Mexican, Andean',  'Vosotros vs Ustedes'],
    portugues:['Brazilian vs European',                     'Pronunciation and vocabulary'],
    ingles:   ['US, UK, AUS, India',                        'Pronunciation and slang'],
    frances:  ['Metropolitan, Québécois',                   'Vocabulary and pronunciation'],
    arabe:    ['MSA + dialects (Egyptian, Levantine...)',    'Dialects can be mutually unintelligible'],
    chino:    ['Mandarin, Cantonese, Hokkien',              'Tones and characters'],
  };

  const vMap = __lang === 'en' ? vEn : vEs;
  const fallback = vMap.espanol;
  const [va, dif] = vMap[id] ?? fallback;

  const resumen = __lang === 'en'
    ? `${id}: ${va}. ${dif}.`
    : `${id}: ${va}. ${dif}.`;

  return { variantes: va, mayorDif: dif, resumen };
}
