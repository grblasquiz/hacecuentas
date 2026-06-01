export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function paralajeDistanciaEstrellaParsec(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorParalaje: 'Ingresá paralaje positivo',
      unitAL: ' al',
      resumen: (pcVal: string, alVal: string) => `Distancia ${pcVal} pc (${alVal} años luz).`,
    },
    en: {
      errorParalaje: 'Enter a positive parallax value',
      unitAL: ' ly',
      resumen: (pcVal: string, alVal: string) => `Distance ${pcVal} pc (${alVal} light-years).`,
    },
  } as const)[__lang];
  const p = Number(i.paralaje);
  if (!p || p <= 0) throw new Error(T.errorParalaje);
  const pc = 1 / p;
  const al = pc * 3.26;
  return { distanciaPc: pc.toFixed(2) + ' pc', distanciaAL: al.toFixed(2) + T.unitAL, resumen: T.resumen(pc.toFixed(1), al.toFixed(1)) };
}
