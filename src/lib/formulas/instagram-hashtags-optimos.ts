/** Instagram Hashtags Óptimos */
export interface Inputs { tipoPost: string; tamano: string; }
export interface Outputs { cantidadOptima: string; mixRecomendado: string; donePonerlos: string; evitar: string; }

export function instagramHashtagsOptimos(i: Inputs): Outputs {
  const tp = String(i.tipoPost);
  const tam = String(i.tamano);
  if (!tp || !tam) throw new Error('Seleccioná tipo y tamaño');
  const grid: Record<string, Record<string, string>> = {
    'Feed post': { '< 1K followers': '5-7', '1K - 10K': '4-6', '10K - 100K': '3-5', '100K - 1M': '3-4', '+1M': '3-4' },
    'Reel': { '< 1K followers': '5-7', '1K - 10K': '4-5', '10K - 100K': '3-5', '100K - 1M': '3', '+1M': '3' },
    'Story': { '< 1K followers': '1-3', '1K - 10K': '1-2', '10K - 100K': '1-2', '100K - 1M': '1-2', '+1M': '1-2' },
    'Carrousel': { '< 1K followers': '5-8', '1K - 10K': '4-6', '10K - 100K': '3-5', '100K - 1M': '3-4', '+1M': '3-4' },
  };
  const cant = grid[tp]?.[tam] || '3-5';
  const donde = tp === 'Story' ? 'Sticker de hashtag dentro de la story' : 'Caption o primer comentario (reach similar)';
  return {
    cantidadOptima: `${cant} hashtags`,
    mixRecomendado: '1 grande (+5M) + 2 medianos (100K-1M) + 2 nicho (<100K)',
    donePonerlos: donde,
    evitar: 'No repitas el mismo set 10 posts seguidos — IG lo marca como spam',
  };
}
