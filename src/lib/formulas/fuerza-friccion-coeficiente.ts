export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function fuerzaFriccionCoeficiente(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      error: 'Completá μ y N',
      resumen: (f: number, mu: number, n: number) => `Fricción ${f.toFixed(1)} N con μ=${mu} y N=${n}.`,
    },
    en: {
      error: 'Enter μ and N',
      resumen: (f: number, mu: number, n: number) => `Friction ${f.toFixed(1)} N with μ=${mu} and N=${n}.`,
    },
  } as const)[__lang];
  const mu = Number(i.mu); const n = Number(i.n);
  if (!mu || !n) throw new Error(T.error);
  const f = mu * n;
  return { friccion: f.toFixed(2) + ' N', resumen: T.resumen(f, mu, n) };
}
