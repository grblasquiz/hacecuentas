/** Podcast Descargas Monetizar */
export interface Inputs { metaMensualUSD: number; episodiosPorMes: number; cpm: number; slotsPorEpisodio: string; }
export interface Outputs { descargasPorEpisodio: string; descargasMensuales: string; ingresoPorEpisodio: string; factibilidad: string; }

export function podcastDescargasParaMonetizar(i: Inputs): Outputs {
  const meta = Number(i.metaMensualUSD);
  const eps = Number(i.episodiosPorMes);
  const cpm = Number(i.cpm);
  const slotsStr = String(i.slotsPorEpisodio);
  if (meta <= 0 || eps <= 0 || cpm <= 0) throw new Error('Valores inválidos');
  const slots = slotsStr.startsWith('3') ? 3 : slotsStr.startsWith('2') ? 2 : 1;
  const ingresoPor1K = cpm * slots;
  const descTotales = (meta / ingresoPor1K) * 1000;
  const descPorEp = descTotales / eps;
  const ingresoEp = descPorEp / 1000 * ingresoPor1K;
  let fact = '';
  if (descPorEp < 1000) fact = 'Muy factible — meta chica alcanzable en meses';
  else if (descPorEp < 5000) fact = 'Factible con 6-12 meses de consistencia';
  else if (descPorEp < 20000) fact = 'Ambicioso — top 10% de podcasts activos';
  else fact = 'Muy ambicioso — requiere ser top 1% o diversificar ingresos';
  return {
    descargasPorEpisodio: `${Math.round(descPorEp).toLocaleString('es-AR')} descargas/episodio`,
    descargasMensuales: `${Math.round(descTotales).toLocaleString('es-AR')} descargas/mes`,
    ingresoPorEpisodio: `$${ingresoEp.toFixed(2)} USD`,
    factibilidad: fact,
  };
}
