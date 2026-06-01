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
    },
    en: {
      max0: '0h (avoid)',
      c0: 'Video calls with family only',
      c6: 'Quality content, watch together',
      c12: 'Clear limits, no screens while eating',
      c18: 'Help self-regulate, talk about consumption',
    },
  } as const)[__lang];
  const e=Number(i.edad)||0;
  let max:string; let c:string;
  if (e<2) { max=T.max0; c=T.c0; }
  else if (e<6) { max='1h'; c=T.c6; }
  else if (e<12) { max='2h'; c=T.c12; }
  else { max='2-3h'; c=T.c18; }
  const resumen = __lang === 'en'
    ? `Age ${e}: max ${max}. ${c}.`
    : `Edad ${e}: máx ${max}. ${c}.`;
  return { maxDia:max, consejos:c, resumen };
}
