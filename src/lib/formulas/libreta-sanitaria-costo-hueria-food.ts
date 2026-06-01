export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function libretaSanitariaCostoHueriaFood(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { validez: '1 año', resumenTpl: (m: string, v: string) => `Libreta sanitaria ${m}: $${v}/año.` },
    en: { validez: '1 year', resumenTpl: (m: string, v: string) => `Health permit ${m}: $${v}/year.` },
  } as const)[__lang];
  const m=String(i.municipio||'caba');
  const c: Record<string,number> = { caba:15000, 'la-plata':12000, cba:13000, rosario:11000 };
  const val = (c[m]||15000).toLocaleString('es-AR');
  return { costo:'$'+val, validez: T.validez, resumen: T.resumenTpl(m, val) };
}
