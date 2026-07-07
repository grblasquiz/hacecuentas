export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
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
      title: 'Tu ventaja según la edad',
      i0: (e: number) => `A los **${e} años** se está dentro de la "ventana" en la que el cerebro absorbe el idioma sin esfuerzo y casi siempre logra **acento nativo**. La clave es exposición constante, no clases formales.`,
      i1: (e: number) => `A los **${e} años** todavía se consigue muy **buen acento** y ya se puede razonar la gramática. La inmersión (juego, dibujos, amigos en el idioma) rinde más que estudiar reglas.`,
      i2: (e: number) => `A los **${e} años** se aprende rápido combinando **gramática consciente y buena pronunciación**. La motivación es el factor decisivo: conviene atarlo a algo que importe (música, gaming, viajes).`,
      i3: (e: number) => `A los **${e} años** se aprende perfectamente: la **disciplina y la gramática** compensan que el acento perfecto sea más difícil. Apuntá a fluidez y comprensión, no a sonar 100% nativo.`,
      tones: ['good', 'good', 'neutral', 'warn'] as const,
      icon: '🗣️',
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
      title: 'Your edge by age',
      i0: (e: number) => `At **${e} years old** you are inside the "window" where the brain absorbs language effortlessly and almost always reaches a **native accent**. The key is steady exposure, not formal classes.`,
      i1: (e: number) => `At **${e} years old** a very **good accent** is still within reach and grammar can be reasoned. Immersion (play, cartoons, friends in the language) beats studying rules.`,
      i2: (e: number) => `At **${e} years old** learning is fast, combining **conscious grammar and good pronunciation**. Motivation is the deciding factor: tie it to something that matters (music, gaming, travel).`,
      i3: (e: number) => `At **${e} years old** you can learn perfectly: **discipline and grammar** make up for a near-perfect accent being harder. Aim for fluency and comprehension, not sounding 100% native.`,
      tones: ['good', 'good', 'neutral', 'warn'] as const,
      icon: '🗣️',
    },
  } as const)[__lang];
  const e=Number(i.edad)||0;
  let v:string; let d:string; let band:number;
  if (e<6) { v=T.v0; d=T.d0; band=0; }
  else if (e<12) { v=T.v1; d=T.d1; band=1; }
  else if (e<20) { v=T.v2; d=T.d2; band=2; }
  else { v=T.v3; d=T.d3; band=3; }
  const insTexts=[T.i0,T.i1,T.i2,T.i3];
  const _insight={
    title:T.title,
    text:insTexts[band](e),
    tone:T.tones[band],
    icon:T.icon,
  };
  return { ventajas:v, desventajas:d, resumen:T.resumen(e,v,d), _insight };
}
