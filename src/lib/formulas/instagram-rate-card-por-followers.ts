/** Instagram Rate Card */
export interface Inputs { seguidores: number; engagementRate: number; }
export interface Outputs { ratePost: string; rateReel: string; rateStory: string; rateCollab: string; _insight?: any; _chart?: any; }

export function instagramRateCardPorFollowers(i: Inputs): Outputs {
  const seg = Number(i.seguidores);
  const er = Number(i.engagementRate);
  if (seg <= 0 || er <= 0) throw new Error('Ingresá valores válidos');
  let base = (seg / 1000) * 10;
  let adj = 1;
  if (er < 1) adj = 0.5;
  else if (er < 2) adj = 0.7;
  else if (er < 4) adj = 1;
  else if (er < 6) adj = 1.2;
  else if (er < 10) adj = 1.5;
  else adj = 2;
  const post = base * adj;
  const reel = post * 1.75;
  const story = post * 0.4;
  const collab = post + reel + story * 3;
  const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')} USD`;

  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (adj >= 1.2) {
    insightTone = 'good';
    insightText = `Con **${er}%** de engagement (muy por encima del promedio) tu tarifa lleva un **+${Math.round((adj - 1) * 100)}%** premium: un post vale **${fmt(post)}** y un reel **${fmt(reel)}**. Audiencias así de activas justifican cobrar por encima del rate base.`;
  } else if (adj < 1) {
    insightTone = 'warn';
    insightText = `Tu engagement de **${er}%** está por debajo del promedio, así que el rate se ajusta a la baja (**−${Math.round((1 - adj) * 100)}%**): un post sale **${fmt(post)}**. Subí la interacción antes de pedir tarifas mayores; las marcas miran el ER, no solo los seguidores.`;
  } else {
    insightTone = 'neutral';
    insightText = `Con **${seg.toLocaleString('es-AR')}** seguidores y **${er}%** de engagement, un post ronda **${fmt(post)}** y un reel **${fmt(reel)}**. Es un rate de mercado estándar: usalo como piso para negociar.`;
  }
  const insight = {
    title: 'Tu poder de tarifa',
    text: insightText,
    tone: insightTone,
    icon: '💸',
  };

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Post de feed', value: Math.round(post) },
      { label: 'Reel', value: Math.round(reel) },
      { label: '3 stories', value: Math.round(story * 3) },
    ],
    prefix: '$',
    centerValue: fmt(collab),
    centerLabel: 'Pack colaboración',
    ariaLabel: 'Composición del pack de colaboración: un post, un reel y tres stories.',
  };

  return {
    ratePost: fmt(post),
    rateReel: fmt(reel),
    rateStory: fmt(story),
    rateCollab: fmt(collab),
    _insight: insight,
    _chart: chart,
  };
}
