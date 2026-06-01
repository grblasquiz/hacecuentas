export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function edadOptimaAprenderIdiomaNinosAdultos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      v0: 'Absorción natural, acento nativo',
      d0: 'Sin gramática consciente',
      v1: 'Acento bueno, analítico',
      d1: 'Necesita inmersión',
      v2: 'Gramática + buena pronunciación',
      d2: 'Motivación fluctúa',
      v3: 'Disciplina, gramática fuerte',
      d3: 'Acento más difícil',
      resumen: (e: number, v: string, d: string) => `Edad ${e}: ${v}. ${d}.`,
    },
    en: {
      v0: 'Natural absorption, native accent',
      d0: 'No conscious grammar needed',
      v1: 'Good accent, analytical learner',
      d1: 'Needs immersion',
      v2: 'Grammar + good pronunciation',
      d2: 'Motivation fluctuates',
      v3: 'Discipline, strong grammar',
      d3: 'Accent harder to achieve',
      resumen: (e: number, v: string, d: string) => `Age ${e}: ${v}. ${d}.`,
    },
  } as const)[__lang];
  const e=Number(i.edad)||0;
  let v:string; let d:string;
  if (e<6) { v=T.v0; d=T.d0; }
  else if (e<12) { v=T.v1; d=T.d1; }
  else if (e<20) { v=T.v2; d=T.d2; }
  else { v=T.v3; d=T.d3; }
  return { ventajas:v, desventajas:d, resumen:T.resumen(e,v,d) };
}
