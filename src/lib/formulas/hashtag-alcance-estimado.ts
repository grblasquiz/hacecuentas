/** Calculadora de Alcance Estimado por Hashtags */
export interface Inputs { seguidores: number; hashtagsGrandes: number; hashtagsMedianps: number; hashtagsPequenos: number; }
export interface Outputs { alcanceEstimado: number; alcanceOrganico: number; alcanceHashtags: number; recomendacion: string; }

export function hashtagAlcanceEstimado(i: Inputs): Outputs {
  const seg = Number(i.seguidores);
  const grandes = Number(i.hashtagsGrandes) || 0;
  const medianos = Number(i.hashtagsMedianps) || 0;
  const peqs = Number(i.hashtagsPequenos) || 0;
  if (!seg || seg <= 0) throw new Error('Ingresá tus seguidores');

  const totalHashtags = grandes + medianos + peqs;
  if (totalHashtags > 30) throw new Error('Instagram permite máximo 30 hashtags');

  // Base organic reach: ~10-20% of followers (Instagram 2026 avg)
  const alcanceOrganico = Math.round(seg * 0.15);

  // Hashtag reach estimation (very approximate)
  // Large hashtags: high competition, ~0.5-2% reach bonus per hashtag
  // Medium: ~2-5% reach bonus per hashtag
  // Small/niche: ~5-15% reach bonus per hashtag (higher chance of being seen)
  const reachGrandes = grandes * seg * 0.01;
  const reachMedianos = medianos * seg * 0.03;
  const reachPeqs = peqs * seg * 0.08;
  const alcanceHashtags = Math.round(reachGrandes + reachMedianos + reachPeqs);
  const alcanceEstimado = alcanceOrganico + alcanceHashtags;

  let recomendacion: string;
  if (peqs > grandes && medianos >= grandes) {
    recomendacion = 'Buena estrategia — priorizás hashtags de nicho que dan más visibilidad relativa. Mantené el mix.';
  } else if (grandes > peqs) {
    recomendacion = 'Demasiados hashtags grandes — tu post se pierde en la competencia. Usá más hashtags de nicho (<100K posts) para mejor visibilidad.';
  } else {
    recomendacion = `Con ${totalHashtags} hashtags, tu alcance estimado es ${alcanceEstimado.toLocaleString()}. Mix ideal: 2-3 grandes, 5-7 medianos, 8-10 nicho.`;
  }

  return { alcanceEstimado, alcanceOrganico, alcanceHashtags, recomendacion };
}
