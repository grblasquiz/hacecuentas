export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function calcioDietaDiariaOsteoporosisMujer(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const e=Number(i.edad)||0; const sx=String(i.sexo||'mujer'); const emb=String(i.embarazada||'no');
  let rda=1000;
  if(emb==='si') rda=1300;
  else if(e<19) rda=1300;
  else if(e>50&&sx==='mujer') rda=1200;
  else if(e>70) rda=1200;
  const T = ({
    es: {
      rdaLabel: `${rda} mg/día`,
      recomendacion: `Mujer ${e} años: ${rda} mg/día. 2-3 porciones lácteos + vegetales verdes cubren.`,
      fuentes: 'Lácteos (300 mg/taza), sardinas, brócoli, almendras, semillas chía.',
    },
    en: {
      rdaLabel: `${rda} mg/day`,
      recomendacion: `Woman aged ${e}: ${rda} mg/day. 2–3 servings of dairy + leafy greens will cover it.`,
      fuentes: 'Dairy (300 mg/cup), sardines, broccoli, almonds, chia seeds.',
    },
  } as const)[__lang];
  return { rda: T.rdaLabel, recomendacion: T.recomendacion, fuentes: T.fuentes };
}
