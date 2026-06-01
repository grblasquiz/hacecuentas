export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function podcastsAprenderIdiomaMinutosDiarios(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      a1t: 'Para principiantes absolutos',
      a2t: 'Graded, transcripción',
      b1t: 'Graded sin transcripción',
      b2t: 'Nativos lentos',
      c1t: 'Nativos normales',
    },
    en: {
      a1t: 'For absolute beginners',
      a2t: 'Graded, with transcript',
      b1t: 'Graded, no transcript',
      b2t: 'Slow native speakers',
      c1t: 'Normal native speakers',
    },
    pt: {
      a1t: 'Para iniciantes absolutos',
      a2t: 'Graduado, com transcrição',
      b1t: 'Graduado, sem transcrição',
      b2t: 'Falantes nativos lentos',
      c1t: 'Falantes nativos normais',
    },
  } as const)[__lang];
  const n=String(i.nivel||'a1');
  const p:Record<string,[string,string]>={a1:['15 min',T.a1t],a2:['20 min',T.a2t],b1:['30 min',T.b1t],b2:['30-45 min',T.b2t],c1:['45+ min',T.c1t]};
  const [m,t]=p[n]||p.a1;
  return { minDia:m, tipo:t, resumen:__lang === 'en' ? `${n.toUpperCase()}: ${m}/day. ${t}.` : __lang === 'pt' ? `${n.toUpperCase()}: ${m}/dia. ${t}.` : `${n.toUpperCase()}: ${m}/día. ${t}.` };
}
