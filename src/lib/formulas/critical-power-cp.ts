export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function criticalPowerCp(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorIncomplete: 'Completá',
      resumen: (cp: string) => `CP ≈ ${cp} W desde 2 puntos de esfuerzo máximo.`,
      insightTitle: 'Tu techo aeróbico y tu batería anaeróbica',
      insightText: (cp: string, w: string) => `Tu Critical Power es **${cp} W**: la potencia más alta que podés sostener mucho tiempo sin fatigarte. Por encima de ese umbral tenés una reserva finita (W′) de **${w} J** que se agota en esfuerzos cortos y se recupera al bajar de la CP.`,
    },
    en: {
      errorIncomplete: 'Fill in all fields',
      resumen: (cp: string) => `CP ≈ ${cp} W from 2 maximal effort points.`,
      insightTitle: 'Your aerobic ceiling and anaerobic battery',
      insightText: (cp: string, w: string) => `Your Critical Power is **${cp} W**: the highest power you can hold for a long time without fatiguing. Above that threshold you have a finite reserve (W′) of **${w} J** that depletes in short efforts and recovers when you drop below CP.`,
    },
  } as const)[__lang];
  const t1 = Number(i.t1); const p1 = Number(i.p1);
  const t2 = Number(i.t2); const p2 = Number(i.p2);
  if (!t1 || !p1 || !t2 || !p2) throw new Error(T.errorIncomplete);
  const W = (p1 * t1 - p2 * t2) / (t1 - t2) * (t1 - t2) / (p1 - p2);
  const CP = (p1 * t1 - p2 * t2) / (t1 - t2);
  const wPrimeStr = (W * (p1 - p2) / (t1 - t2) * 1).toFixed(0);
  return { cp: CP.toFixed(0) + ' W', wPrime: wPrimeStr + ' J',
    resumen: T.resumen(CP.toFixed(0)),
    _insight: {
      title: T.insightTitle,
      text: T.insightText(CP.toFixed(0), Number(wPrimeStr).toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR')),
      tone: 'neutral',
      icon: '🚴',
    } };
}
