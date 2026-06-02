export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function cafeinaDosisSeguraDiariaPeso(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      equivalencia: (cups: number) => `~${cups} tazas café (95 mg/taza)`,
      recEmb: 'Embarazo: máx 200 mg. Ideal <100 mg.',
      recNormal: '400 mg = límite FDA. Menos si problemas sueño/ansiedad.',
      insTitle: 'Tu techo de cafeína',
      insEmb: (mg: number, cups: number) => `Embarazada: tu límite es **${mg} mg/día** (~**${cups} tazas**). Es la mitad del tope general; conviene quedarse aún más abajo, cerca de 100 mg.`,
      insCapped: (cups: number) => `Tu peso permitiría más, pero el techo se fija en **400 mg/día** (~**${cups} tazas**), el límite que marca la FDA para adultos sanos.`,
      insWeight: (mg: number, cups: number) => `Por tu peso, tu dosis segura es **${mg} mg/día** (~**${cups} tazas**), por debajo del tope FDA de 400 mg. Repartila en el día, no toda junta.`,
      segLow: 'Bajo', segMod: 'Moderado', segLimit: 'Límite FDA', segHigh: 'Excesivo',
      markerLabel: 'Tu máximo',
      aria: 'Escala de cafeína diaria con tu máximo seguro ubicado entre las zonas de referencia',
      center: 'máx/día',
    },
    en: {
      equivalencia: (cups: number) => `~${cups} cups of coffee (95 mg/cup)`,
      recEmb: 'Pregnancy: max 200 mg. Ideally <100 mg.',
      recNormal: '400 mg = FDA limit. Less if you have sleep or anxiety issues.',
      insTitle: 'Your caffeine ceiling',
      insEmb: (mg: number, cups: number) => `Pregnant: your limit is **${mg} mg/day** (~**${cups} cups**). That is half the general cap; staying even lower, around 100 mg, is advisable.`,
      insCapped: (cups: number) => `Your weight would allow more, but the ceiling is set at **400 mg/day** (~**${cups} cups**), the FDA limit for healthy adults.`,
      insWeight: (mg: number, cups: number) => `For your weight, your safe dose is **${mg} mg/day** (~**${cups} cups**), below the FDA cap of 400 mg. Spread it through the day, not all at once.`,
      segLow: 'Low', segMod: 'Moderate', segLimit: 'FDA limit', segHigh: 'Excessive',
      markerLabel: 'Your max',
      aria: 'Daily caffeine scale with your safe maximum placed among reference zones',
      center: 'max/day',
    },
  } as const)[__lang];
  const p=Number(i.pesoKg)||0; const emb=String(i.embarazada||'no');
  let max=Math.min(400,p*6);
  if(emb==='si') max=200;
  const maxR = Math.round(max);
  const cups = Math.round(max/95);
  const _insight = {
    title: T.insTitle,
    text: emb==='si' ? T.insEmb(maxR, cups) : (p*6 > 400 ? T.insCapped(cups) : T.insWeight(maxR, cups)),
    tone: emb==='si' ? 'warn' : 'neutral',
    icon: '☕',
  };
  const _chart = {
    type: 'scale',
    marker: maxR,
    markerLabel: T.markerLabel,
    min: 0,
    segments: [
      { nombre: T.segLow, max: 200, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: T.segMod, max: 400, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: T.segLimit, max: 600, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: T.segHigh, max: 800, color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: T.aria,
  };
  return { maximoDiario:`${maxR} mg`, equivalencia:T.equivalencia(cups), recomendacion:emb==='si'?T.recEmb:T.recNormal, _insight, _chart };
}
