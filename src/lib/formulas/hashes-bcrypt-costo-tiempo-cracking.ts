export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function hashesBcryptCostoTiempoCracking(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { ok: 'OK', bajo: 'Subí a 10+', lento: 'Puede ser lento en servidor' },
    en: { ok: 'OK', bajo: 'Increase to 10+', lento: 'May be slow on the server' },
  } as const)[__lang];
  const c=Math.floor(Number(i.cost)||10);
  const base=2; const ms=base*Math.pow(2,c-10);
  const hs=1000/ms;
  let rec=T.ok; if (c<10) rec=T.bajo; else if (c>14) rec=T.lento;
  return { hashPorSeg:`${hs.toFixed(1)}/s`, tiempo:`${ms.toFixed(1)} ms`, recomendacion:rec, resumen:`Cost ${c}: ${ms.toFixed(0)}ms/hash (${hs.toFixed(0)}/s).` };
}
