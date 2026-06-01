export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function energiaCineticaEc(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { error: 'Completá' },
    en: { error: 'Fill in the fields' },
    pt: { error: 'Preencha os campos' },
  } as const)[__lang];
  const m = Number(i.masa); const v = Number(i.velocidad);
  if (!m || v === undefined) throw new Error(T.error);
  const Ec = 0.5 * m * v * v;
  const resumen = __lang === 'en'
    ? `Ec = ${Ec.toFixed(1)} J with m=${m}kg at ${v}m/s.`
    : __lang === 'pt'
    ? `Ec = ${Ec.toFixed(1)} J com m=${m}kg a ${v}m/s.`
    : `Ec = ${Ec.toFixed(1)} J con m=${m}kg a ${v}m/s.`;
  return { energia: Ec.toFixed(2) + ' J', resumen };
}
