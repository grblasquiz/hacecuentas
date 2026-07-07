export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function energiaPotencialGravitatoria(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      error: 'Completá',
      resumen: (Ep: number, m: number, h: number) => `Ep = ${Ep.toFixed(1)} J con m=${m}kg a altura ${h}m.`,
      insightTitle: 'Energía potencial',
      insightText: (Ep: number, m: number, h: number) => `Una masa de **${m} kg** a **${h} m** de altura almacena **${Ep.toFixed(1)} J** de energía potencial, lista para convertirse en cinética si cae.`,
    },
    en: {
      error: 'Fill in the fields',
      resumen: (Ep: number, m: number, h: number) => `Ep = ${Ep.toFixed(1)} J with m=${m}kg at height ${h}m.`,
      insightTitle: 'Potential energy',
      insightText: (Ep: number, m: number, h: number) => `A **${m} kg** mass at **${h} m** high stores **${Ep.toFixed(1)} J** of potential energy, ready to turn into kinetic energy if it falls.`,
    },
  } as const)[__lang];
  const m = Number(i.masa); const h = Number(i.h); const g = Number(i.g) || 9.81;
  if (!m || h === undefined) throw new Error(T.error);
  const Ep = m * g * h;
  const _insight = {
    title: T.insightTitle,
    text: T.insightText(Ep, m, h),
    tone: 'neutral',
    icon: '⛰️',
  };
  return { energia: Ep.toFixed(2) + ' J', resumen: T.resumen(Ep, m, h), _insight };
}
