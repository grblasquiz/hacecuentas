/** Stories vs Feed Vistas IG */
export interface Inputs { seguidores: number; vistasStoryPromedio: number; }
export interface Outputs { reachFeedEstimado: string; ratio: string; storiesEquivalentes: string; recomendacion: string; }

export function instagramStoriesVsFeedVistas(i: Inputs): Outputs {
  const seg = Number(i.seguidores);
  const vs = Number(i.vistasStoryPromedio);
  if (seg <= 0 || vs <= 0) throw new Error('Ingresá valores válidos');
  const feedReach = Math.round(seg * 0.18);
  const ratio = feedReach / vs;
  const equiv = Math.max(1, Math.round(ratio * 10) / 10);
  let rec = '';
  if (ratio > 2.5) rec = 'Tus stories tienen bajo reach — revisá interacción reciente (DMs, likes)';
  else if (ratio > 1.5) rec = 'Ratio estándar — mezcla 60% feed/reel + 40% stories funciona bien';
  else rec = 'Tus stories sobre-rinden vs feed — escalá frecuencia de stories';
  return {
    reachFeedEstimado: `${feedReach.toLocaleString('es-AR')} personas (~18% followers)`,
    ratio: `${ratio.toFixed(2)}x`,
    storiesEquivalentes: `${equiv} stories ≈ 1 feed post`,
    recomendacion: rec,
  };
}
