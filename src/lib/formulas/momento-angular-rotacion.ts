export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function momentoAngularRotacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { error: 'Completá' },
    en: { error: 'Fill in all fields' },
  } as const)[__lang];
  const I = Number(i.inercia); const w = Number(i.omega);
  if (!I || !w) throw new Error(T.error);
  const L = I * w;
  const resumen = __lang === 'en'
    ? `L = ${L.toFixed(2)} kg·m²/s with I=${I} and ω=${w} rad/s.`
    : `L = ${L.toFixed(2)} kg·m²/s con I=${I} y ω=${w} rad/s.`;
  return { momento: L.toFixed(3) + ' kg·m²/s', resumen };
}
