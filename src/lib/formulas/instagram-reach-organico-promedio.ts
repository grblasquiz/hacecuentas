/** Instagram Reach Orgánico */
export interface Inputs { seguidores: number; engagementRate: number; }
export interface Outputs { reachFeed: string; reachReel: string; reachStory: string; diagnostico: string; }

export function instagramReachOrganicoPromedio(i: Inputs): Outputs {
  const seg = Number(i.seguidores);
  const er = Number(i.engagementRate);
  if (seg <= 0 || er <= 0) throw new Error('Ingresá valores válidos');
  let feedPct = 0.12, reelPct = 0.35, storyPct = 0.08;
  if (er < 1) { feedPct = 0.07; reelPct = 0.2; storyPct = 0.06; }
  else if (er < 3) { feedPct = 0.15; reelPct = 0.35; storyPct = 0.09; }
  else if (er < 6) { feedPct = 0.25; reelPct = 0.55; storyPct = 0.12; }
  else if (er < 10) { feedPct = 0.35; reelPct = 0.8; storyPct = 0.16; }
  else { feedPct = 0.45; reelPct = 1.5; storyPct = 0.20; }
  const feed = Math.round(seg * feedPct);
  const reel = Math.round(seg * reelPct);
  const story = Math.round(seg * storyPct);
  let diag = '';
  if (feedPct < 0.1) diag = 'Reach bajo — probablemente shadowban o bajo ER sostenido';
  else if (feedPct < 0.2) diag = 'Reach estándar — es el promedio global 2026';
  else diag = 'Reach saludable — el algoritmo te está empujando';
  return {
    reachFeed: `${feed.toLocaleString('es-AR')} personas (${(feedPct*100).toFixed(0)}% de followers)`,
    reachReel: `${reel.toLocaleString('es-AR')} personas (${(reelPct*100).toFixed(0)}% de followers)`,
    reachStory: `${story.toLocaleString('es-AR')} personas (${(storyPct*100).toFixed(0)}% de followers)`,
    diagnostico: diag,
  };
}
