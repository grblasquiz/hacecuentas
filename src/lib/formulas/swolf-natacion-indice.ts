export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function swolfNatacionIndice(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      Elite: 'Elite',
      Avanzado: 'Avanzado',
      Intermedio: 'Intermedio',
      Principiante: 'Principiante',
      insightTitle: 'Tu eficiencia en el agua',
      insightText: (sw: number, nivel: string) => `Tu SWOLF de **${sw}** te ubica en nivel **${nivel}**. Cuanto más bajo el número, más eficiente nadás: lo bajás recortando tiempo por largo o reduciendo brazadas (mejor deslizamiento).`,
      markerLabel: 'Tu SWOLF',
      chartAria: (sw: number, nivel: string) => `Índice SWOLF de ${sw}, nivel ${nivel}, sobre una escala donde menor es mejor.`,
    },
    en: {
      Elite: 'Elite',
      Avanzado: 'Advanced',
      Intermedio: 'Intermediate',
      Principiante: 'Beginner',
      insightTitle: 'Your efficiency in the water',
      insightText: (sw: number, nivel: string) => `Your SWOLF of **${sw}** places you at the **${nivel}** level. The lower the number, the more efficient you swim: lower it by cutting time per lap or reducing strokes (better glide).`,
      markerLabel: 'Your SWOLF',
      chartAria: (sw: number, nivel: string) => `SWOLF index of ${sw}, ${nivel} level, on a scale where lower is better.`,
    },
  } as const)[__lang];
  const t = Number(i.tiempo) || 0; const b = Number(i.brazadas) || 0;
  const sw = t + b;
  const nivel = sw < 40 ? T.Elite : sw < 56 ? T.Avanzado : sw < 70 ? T.Intermedio : T.Principiante;
  const resumen = __lang === 'en'
    ? `SWOLF ${sw} — ${nivel}. Improve by lowering time OR strokes.`
    : `SWOLF ${sw} — ${nivel}. Mejorá bajando tiempo O brazadas.`;
  return {
    swolf: sw.toString(),
    nivel,
    resumen,
    _insight: {
      title: T.insightTitle,
      text: T.insightText(sw, nivel),
      tone: sw < 56 ? 'good' : 'neutral',
      icon: '🏊',
    },
    _chart: {
      type: 'scale',
      marker: sw,
      markerLabel: T.markerLabel,
      min: 20,
      segments: [
        { nombre: T.Elite, max: 40, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: T.Avanzado, max: 56, color: '#65a30d', colorDark: '#84cc16' },
        { nombre: T.Intermedio, max: 70, color: '#d97706', colorDark: '#f59e0b' },
        { nombre: T.Principiante, max: Math.max(90, sw + 5), color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: T.chartAria(sw, nivel),
    },
  };
}
