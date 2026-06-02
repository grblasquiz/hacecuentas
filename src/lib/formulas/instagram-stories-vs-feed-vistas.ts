/** Stories vs Feed Vistas IG */
export interface Inputs { seguidores: number; vistasStoryPromedio: number; }
export interface Outputs { reachFeedEstimado: string; ratio: string; storiesEquivalentes: string; recomendacion: string; _insight?: any; _chart?: any; }

export function instagramStoriesVsFeedVistas(i: Inputs): Outputs {
  const seg = Number(i.seguidores);
  const vs = Number(i.vistasStoryPromedio);
  if (seg <= 0 || vs <= 0) throw new Error('Ingresá valores válidos');
  const feedReach = Math.round(seg * 0.18);
  const ratio = feedReach / vs;
  const equiv = Math.max(1, Math.round(ratio * 10) / 10);
  let rec = '';
  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  if (ratio > 2.5) { rec = 'Tus stories tienen bajo reach — revisá interacción reciente (DMs, likes)'; tone = 'warn'; }
  else if (ratio > 1.5) { rec = 'Ratio estándar — mezcla 60% feed/reel + 40% stories funciona bien'; tone = 'neutral'; }
  else { rec = 'Tus stories sobre-rinden vs feed — escalá frecuencia de stories'; tone = 'good'; }
  return {
    reachFeedEstimado: `${feedReach.toLocaleString('es-AR')} personas (~18% followers)`,
    ratio: `${ratio.toFixed(2)}x`,
    storiesEquivalentes: `${equiv} stories ≈ 1 feed post`,
    recomendacion: rec,
    _insight: {
      title: 'Stories vs feed',
      text: `Tu feed alcanza ~**${feedReach.toLocaleString('es-AR')}** personas contra **${vs.toLocaleString('es-AR')}** vistas por story: hacen falta **${equiv} stories** para igualar 1 posteo de feed (ratio **${ratio.toFixed(2)}x**). ${rec}.`,
      tone,
      icon: '📲',
    },
    _chart: {
      type: 'scale',
      marker: Number(ratio.toFixed(2)),
      markerLabel: `Ratio ${ratio.toFixed(2)}x`,
      min: 0,
      segments: [
        { nombre: 'Stories rinden', max: 1.5, color: '#86efac', colorDark: '#22c55e' },
        { nombre: 'Estándar', max: 2.5, color: '#fde68a', colorDark: '#f59e0b' },
        { nombre: 'Stories flojas', max: Math.max(4, ratio * 1.1), color: '#fca5a5', colorDark: '#ef4444' },
      ],
      ariaLabel: `Ratio feed/stories de ${ratio.toFixed(2)}x ubicado en la zona de rendimiento de tus stories`,
    },
  };
}
