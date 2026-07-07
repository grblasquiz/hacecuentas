export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function podcastsAprenderIdiomaMinutosDiarios(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      a1t: 'Para principiantes absolutos',
      a2t: 'Graded, transcripción',
      b1t: 'Graded sin transcripción',
      b2t: 'Nativos lentos',
      c1t: 'Nativos normales',
      ititle: 'Tu dosis diaria',
      ipre: 'Para tu nivel',
      irec: 'la dosis recomendada es de',
      idia: 'al día de escucha',
      icont: 'La constancia diaria rinde más que sesiones largas espaciadas.',
    },
    en: {
      a1t: 'For absolute beginners',
      a2t: 'Graded, with transcript',
      b1t: 'Graded, no transcript',
      b2t: 'Slow native speakers',
      c1t: 'Normal native speakers',
      ititle: 'Your daily dose',
      ipre: 'For your level',
      irec: 'the recommended dose is',
      idia: 'of listening per day',
      icont: 'Daily consistency beats long, spaced-out sessions.',
    },
    pt: {
      a1t: 'Para iniciantes absolutos',
      a2t: 'Graduado, com transcrição',
      b1t: 'Graduado, sem transcrição',
      b2t: 'Falantes nativos lentos',
      c1t: 'Falantes nativos normais',
      ititle: 'Sua dose diária',
      ipre: 'Para o seu nível',
      irec: 'a dose recomendada é de',
      idia: 'de escuta por dia',
      icont: 'A constância diária rende mais que sessões longas e espaçadas.',
    },
  } as const)[__lang];
  const n=String(i.nivel||'a1');
  const p:Record<string,[string,string]>={a1:['15 min',T.a1t],a2:['20 min',T.a2t],b1:['30 min',T.b1t],b2:['30-45 min',T.b2t],c1:['45+ min',T.c1t]};
  const [m,t]=p[n]||p.a1;
  const _insight = {
    title: T.ititle,
    text: `${T.ipre} **${n.toUpperCase()}** ${T.irec} **${m}** ${T.idia} (${t.toLowerCase()}). ${T.icont}`,
    tone: 'good',
    icon: '🎧',
  };
  return { minDia:m, tipo:t, resumen:__lang === 'en' ? `${n.toUpperCase()}: ${m}/day. ${t}.` : __lang === 'pt' ? `${n.toUpperCase()}: ${m}/dia. ${t}.` : `${n.toUpperCase()}: ${m}/día. ${t}.`, _insight };
}
