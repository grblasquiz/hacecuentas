/** Instagram Rate Card */
export interface Inputs { seguidores: number; engagementRate: number; }
export interface Outputs { ratePost: string; rateReel: string; rateStory: string; rateCollab: string; }

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
  return {
    ratePost: fmt(post),
    rateReel: fmt(reel),
    rateStory: fmt(story),
    rateCollab: fmt(collab),
  };
}
