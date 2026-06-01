export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cafeinaDosisSeguraDiariaPeso(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      equivalencia: (cups: number) => `~${cups} tazas café (95 mg/taza)`,
      recEmb: 'Embarazo: máx 200 mg. Ideal <100 mg.',
      recNormal: '400 mg = límite FDA. Menos si problemas sueño/ansiedad.',
    },
    en: {
      equivalencia: (cups: number) => `~${cups} cups of coffee (95 mg/cup)`,
      recEmb: 'Pregnancy: max 200 mg. Ideally <100 mg.',
      recNormal: '400 mg = FDA limit. Less if you have sleep or anxiety issues.',
    },
  } as const)[__lang];
  const p=Number(i.pesoKg)||0; const emb=String(i.embarazada||'no');
  let max=Math.min(400,p*6);
  if(emb==='si') max=200;
  return { maximoDiario:`${Math.round(max)} mg`, equivalencia:T.equivalencia(Math.round(max/95)), recomendacion:emb==='si'?T.recEmb:T.recNormal };
}
