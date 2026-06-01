export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function desalojoCausaPlazosHonorariosJuicio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const c=String(i.causa||'fp');
  const t: Record<string, Record<string,string>> = {
    fp:   { es: '6-18 meses',  en: '6-18 months' },
    venc: { es: '3-8 meses',   en: '3-8 months' },
    incu: { es: '8-24 meses',  en: '8-24 months' },
  };
  const tiempo = (t[c] ?? t.fp)[__lang];
  const honorarios = __lang === 'en' ? '15-25% of rent value' : '15-25% valor locativo';
  const resumen = __lang === 'en'
    ? `Eviction ${c}: ${tiempo}, legal fees 15-25% of value.`
    : `Desalojo ${c}: ${(t[c]||t.fp)['es']}, honorarios 15-25% del valor.`;
  return { tiempo, honorarios, resumen };
}
