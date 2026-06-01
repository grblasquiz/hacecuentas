export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sistemaEcuaciones2x2Cramer(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      singular: 'Sistema singular: sin solución única.',
      unica: (x: string, y: string) => `Solución única: x=${x}, y=${y}.`,
    },
    en: {
      singular: 'Singular system: no unique solution.',
      unica: (x: string, y: string) => `Unique solution: x=${x}, y=${y}.`,
    },
  } as const)[__lang];
  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0; const d=Number(i.d)||0; const e=Number(i.e)||0; const f=Number(i.f)||0;
  const det=a*d-b*c;
  if (Math.abs(det)<1e-10) return { x:'—', y:'—', det:'0', resumen: T.singular };
  return { x:((e*d-b*f)/det).toFixed(3), y:((a*f-e*c)/det).toFixed(3), det:det.toFixed(2), resumen: T.unica(((e*d-b*f)/det).toFixed(2), ((a*f-e*c)/det).toFixed(2)) };
}
