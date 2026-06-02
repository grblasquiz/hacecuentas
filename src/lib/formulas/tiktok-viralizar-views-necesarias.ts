/** TikTok Vistas para Viralizar */
export interface Inputs { seguidores: number; vistasPromedio: number; }
export interface Outputs { umbralViral: string; umbralMegaViral: string; tier: string; probabilidad: string; _insight?: any; _chart?: any; }

export function tiktokViralizarViewsNecesarias(i: Inputs): Outputs {
  const seg = Number(i.seguidores) || 0;
  const vp = Number(i.vistasPromedio);
  if (vp <= 0) throw new Error('Ingresá vistas promedio válidas');
  const viral = vp * 20;
  const mega = vp * 100;
  let tier = '';
  if (seg < 1000) tier = 'Nano (<1K followers)';
  else if (seg < 10000) tier = 'Micro (1K-10K)';
  else if (seg < 100000) tier = 'Medium (10K-100K)';
  else if (seg < 1000000) tier = 'Macro (100K-1M)';
  else tier = 'Mega (+1M)';
  const viralFmt = Math.round(viral).toLocaleString('es-AR');
  const _insight = {
    title: 'Tu umbral viral',
    text: `Sos **${tier}**: un video tuyo se considera viral al pasar **${viralFmt} vistas** (20x tu promedio de ${Math.round(vp).toLocaleString('es-AR')}). El salto a mega-viral exige **${Math.round(mega).toLocaleString('es-AR')} vistas**, y solo ~2% de los videos llegan ahí.`,
    tone: 'neutral' as const,
    icon: '🚀',
  };
  // Gauge: posiciona tus seguidores dentro de los tiers de creador
  const segMarker = Math.max(seg, 1);
  const lastMax = segMarker >= 1000000 ? Math.max(5000000, segMarker * 1.2) : 1000000;
  const _chart = {
    type: 'scale' as const,
    marker: segMarker,
    markerLabel: tier,
    min: 0,
    segments: [
      { nombre: 'Nano', max: 1000, color: '#94a3b8', colorDark: '#64748b' },
      { nombre: 'Micro', max: 10000, color: '#38bdf8', colorDark: '#0ea5e9' },
      { nombre: 'Medium', max: 100000, color: '#34d399', colorDark: '#10b981' },
      { nombre: 'Macro', max: 1000000, color: '#fbbf24', colorDark: '#f59e0b' },
      { nombre: 'Mega', max: lastMax, color: '#f472b6', colorDark: '#ec4899' },
    ],
    ariaLabel: `Tier de creador según seguidores: ${tier}, con ${segMarker.toLocaleString('es-AR')} seguidores.`,
  };
  return {
    umbralViral: `${viralFmt} vistas (20x tu promedio)`,
    umbralMegaViral: `${Math.round(mega).toLocaleString('es-AR')} vistas (100x tu promedio)`,
    tier,
    probabilidad: 'Benchmark global: ~2% de videos viralizan para creators activos',
    _insight,
    _chart,
  };
}
