/** TikTok Vistas para Viralizar */
export interface Inputs { seguidores: number; vistasPromedio: number; }
export interface Outputs { umbralViral: string; umbralMegaViral: string; tier: string; probabilidad: string; }

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
  return {
    umbralViral: `${Math.round(viral).toLocaleString('es-AR')} vistas (20x tu promedio)`,
    umbralMegaViral: `${Math.round(mega).toLocaleString('es-AR')} vistas (100x tu promedio)`,
    tier,
    probabilidad: 'Benchmark global: ~2% de videos viralizan para creators activos',
  };
}
