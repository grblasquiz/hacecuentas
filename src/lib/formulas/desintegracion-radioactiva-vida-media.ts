export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { porcentaje: string; resumen: string; _insight?: any; _chart?: any; [k: string]: any; }
export function desintegracionRadioactivaVidaMedia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const tm = Number(i.tMedia); const t = Number(i.t);
  if (!tm || t === undefined) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá');
  const pct = Math.pow(0.5, t / tm) * 100;
  const vidas = t / tm;
  const resumen = __lang === 'en'
    ? `After ${t} years, ${pct.toFixed(1)}% remains (${vidas.toFixed(1)} half-lives of ${tm}y).`
    : `Tras ${t} años quedan ${pct.toFixed(1)}% (${vidas.toFixed(1)} vidas medias de ${tm}a).`;
  const insightTitle = __lang === 'en' ? 'How much is left' : 'Cuánto queda';
  const insightText = __lang === 'en'
    ? `After **${t} years** (${vidas.toFixed(1)} half-lives), **${pct.toFixed(1)}%** of the original sample remains; **${(100 - pct).toFixed(1)}%** has decayed.`
    : `Tras **${t} años** (${vidas.toFixed(1)} vidas medias) queda **${pct.toFixed(1)}%** de la muestra original; ya se desintegró **${(100 - pct).toFixed(1)}%**.`;
  const segDecayed = __lang === 'en' ? 'Mostly decayed' : 'Casi desintegrado';
  const segHalf = __lang === 'en' ? 'Past half-life' : 'Pasada la vida media';
  const segMost = __lang === 'en' ? 'Most remains' : 'Queda la mayoría';
  const segIntact = __lang === 'en' ? 'Nearly intact' : 'Casi intacto';
  return {
    porcentaje: pct.toFixed(2) + '%',
    resumen,
    _insight: {
      title: insightTitle,
      text: insightText,
      tone: 'neutral',
      icon: '☢️',
    },
    _chart: {
      type: 'scale',
      marker: Number(pct.toFixed(1)),
      markerLabel: `${pct.toFixed(1)}%`,
      min: 0,
      segments: [
        { nombre: segDecayed, max: 10, color: '#ef4444', colorDark: '#b91c1c' },
        { nombre: segHalf, max: 50, color: '#f59e0b', colorDark: '#b45309' },
        { nombre: segMost, max: 90, color: '#84cc16', colorDark: '#4d7c0f' },
        { nombre: segIntact, max: 100, color: '#22c55e', colorDark: '#15803d' },
      ],
      ariaLabel: __lang === 'en'
        ? `${pct.toFixed(1)}% of the sample remains after ${t} years.`
        : `Queda ${pct.toFixed(1)}% de la muestra tras ${t} años.`,
    },
  };
}
