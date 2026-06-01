export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function swolfNatacionIndice(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      Elite: 'Elite',
      Avanzado: 'Avanzado',
      Intermedio: 'Intermedio',
      Principiante: 'Principiante',
    },
    en: {
      Elite: 'Elite',
      Avanzado: 'Advanced',
      Intermedio: 'Intermediate',
      Principiante: 'Beginner',
    },
  } as const)[__lang];
  const t = Number(i.tiempo) || 0; const b = Number(i.brazadas) || 0;
  const sw = t + b;
  const nivel = sw < 40 ? T.Elite : sw < 56 ? T.Avanzado : sw < 70 ? T.Intermedio : T.Principiante;
  const resumen = __lang === 'en'
    ? `SWOLF ${sw} — ${nivel}. Improve by lowering time OR strokes.`
    : `SWOLF ${sw} — ${nivel}. Mejorá bajando tiempo O brazadas.`;
  return { swolf: sw.toString(), nivel, resumen };
}
