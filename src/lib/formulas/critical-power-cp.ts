export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function criticalPowerCp(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorIncomplete: 'Completá',
      resumen: (cp: string) => `CP ≈ ${cp} W desde 2 puntos de esfuerzo máximo.`,
    },
    en: {
      errorIncomplete: 'Fill in all fields',
      resumen: (cp: string) => `CP ≈ ${cp} W from 2 maximal effort points.`,
    },
  } as const)[__lang];
  const t1 = Number(i.t1); const p1 = Number(i.p1);
  const t2 = Number(i.t2); const p2 = Number(i.p2);
  if (!t1 || !p1 || !t2 || !p2) throw new Error(T.errorIncomplete);
  const W = (p1 * t1 - p2 * t2) / (t1 - t2) * (t1 - t2) / (p1 - p2);
  const CP = (p1 * t1 - p2 * t2) / (t1 - t2);
  return { cp: CP.toFixed(0) + ' W', wPrime: (W * (p1 - p2) / (t1 - t2) * 1).toFixed(0) + ' J',
    resumen: T.resumen(CP.toFixed(0)) };
}
