export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function energiaPotencialGravitatoria(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { error: 'Completá', resumen: (Ep: number, m: number, h: number) => `Ep = ${Ep.toFixed(1)} J con m=${m}kg a altura ${h}m.` },
    en: { error: 'Fill in the fields', resumen: (Ep: number, m: number, h: number) => `Ep = ${Ep.toFixed(1)} J with m=${m}kg at height ${h}m.` },
  } as const)[__lang];
  const m = Number(i.masa); const h = Number(i.h); const g = Number(i.g) || 9.81;
  if (!m || h === undefined) throw new Error(T.error);
  const Ep = m * g * h;
  return { energia: Ep.toFixed(2) + ' J', resumen: T.resumen(Ep, m, h) };
}
