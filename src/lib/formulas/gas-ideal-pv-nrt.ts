export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function gasIdealPvNrt(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { error: 'Completá P, V, T', resumen: (n: number, p: number, v: number, t: number) => `n = ${n.toFixed(3)} mol para P=${(p/1000).toFixed(1)}kPa, V=${v}m³, T=${t}K.` },
    en: { error: 'Fill in P, V, T', resumen: (n: number, p: number, v: number, t: number) => `n = ${n.toFixed(3)} mol for P=${(p/1000).toFixed(1)}kPa, V=${v}m³, T=${t}K.` },
  } as const)[__lang];
  const p = Number(i.p); const v = Number(i.v); const t = Number(i.t);
  if (!p || !v || !t) throw new Error(T.error);
  const R = 8.314;
  const n = (p * v) / (R * t);
  return { n: n.toFixed(4) + ' mol', resumen: T.resumen(n, p, v, t) };
}
