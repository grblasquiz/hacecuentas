export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function distanciaCaidaLibreAltura(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      errorTiempo: 'Ingresá tiempo',
    },
    en: {
      errorTiempo: 'Enter a time value',
    },
    pt: {
      errorTiempo: 'Informe o tempo',
    },
  } as const)[__lang];
  const t = Number(i.t); const g = Number(i.g) || 9.81;
  if (!t || t < 0) throw new Error(T.errorTiempo);
  const h = 0.5 * g * t * t;
  const resumen = __lang === 'en'
    ? `In ${t}s it falls ${h.toFixed(1)} m.`
    : __lang === 'pt'
    ? `Em ${t}s cai ${h.toFixed(1)} m.`
    : `En ${t}s cae ${h.toFixed(1)} m.`;
  return { altura: h.toFixed(2) + ' m', resumen };
}
