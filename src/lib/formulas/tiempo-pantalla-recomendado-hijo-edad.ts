export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoPantallaRecomendadoHijoEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      max0: '0h (evitar)',
      c0: 'Solo videollamadas familia',
      c6: 'Contenido de calidad, acompañar',
      c12: 'Límites claros, sin pantallas mientras come',
      c18: 'Ayudar a autorregular, charlar sobre consumo',
      insTitle: 'Recomendación para esta edad',
      ins0: (e: number) => `Antes de los **2 años** la pauta de la OMS y la pediatría es **0 pantallas** (salvo videollamadas con familia). A los **${e}**, lo que más estimula es el juego, la voz y el contacto cara a cara.`,
      ins6: (e: number) => `A los **${e} años** el tope sugerido es **1h/día**, y la clave es el **acompañamiento**: mirar juntos contenido de calidad pesa más que el reloj.`,
      ins12: (e: number) => `A los **${e} años** la pauta ronda **2h/día** de ocio con **límites claros** (nada de pantallas mientras come o antes de dormir).`,
      ins18: (e: number) => `A los **${e} años** se sugiere hasta **2-3h/día** de ocio, con foco en **autorregulación**: charlar sobre lo que consume importa más que prohibir.`,
    },
    en: {
      max0: '0h (avoid)',
      c0: 'Video calls with family only',
      c6: 'Quality content, watch together',
      c12: 'Clear limits, no screens while eating',
      c18: 'Help self-regulate, talk about consumption',
      insTitle: 'Recommendation for this age',
      ins0: (e: number) => `Before age **2**, WHO and pediatric guidance is **0 screens** (family video calls aside). At **${e}**, play, your voice and face-to-face contact stimulate the most.`,
      ins6: (e: number) => `At **${e}** the suggested cap is **1h/day**, and the key is **watching together**: quality content side by side matters more than the clock.`,
      ins12: (e: number) => `At **${e}** the guideline is around **2h/day** of leisure with **clear limits** (no screens while eating or before bed).`,
      ins18: (e: number) => `At **${e}**, up to **2-3h/day** of leisure is suggested, focused on **self-regulation**: talking about what they watch beats banning it.`,
    },
  } as const)[__lang];
  const e=Number(i.edad)||0;
  let max:string; let c:string; let insText:string; let insTone:'good'|'warn'|'neutral'; let insIcon:string;
  if (e<2) { max=T.max0; c=T.c0; insText=T.ins0(e); insTone='warn'; insIcon='🚫'; }
  else if (e<6) { max='1h'; c=T.c6; insText=T.ins6(e); insTone='neutral'; insIcon='📱'; }
  else if (e<12) { max='2h'; c=T.c12; insText=T.ins12(e); insTone='neutral'; insIcon='📱'; }
  else { max='2-3h'; c=T.c18; insText=T.ins18(e); insTone='neutral'; insIcon='📱'; }
  const resumen = __lang === 'en'
    ? `Age ${e}: max ${max}. ${c}.`
    : `Edad ${e}: máx ${max}. ${c}.`;
  return {
    maxDia:max, consejos:c, resumen,
    _insight: { title: T.insTitle, text: insText, tone: insTone, icon: insIcon },
  };
}
