/** Podcast Descargas Monetizar */
export interface Inputs { metaMensualUSD: number; episodiosPorMes: number; cpm: number; slotsPorEpisodio: string; }
export interface Outputs { descargasPorEpisodio: string; descargasMensuales: string; ingresoPorEpisodio: string; factibilidad: string; _insight?: any; _chart?: any; }

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
  let tone = 'neutral';
  if (descPorEp < 1000) { fact = 'Muy factible — meta chica alcanzable en meses'; tone = 'good'; }
  else if (descPorEp < 5000) { fact = 'Factible con 6-12 meses de consistencia'; tone = 'good'; }
  else if (descPorEp < 20000) { fact = 'Ambicioso — top 10% de podcasts activos'; tone = 'warn'; }
  else { fact = 'Muy ambicioso — requiere ser top 1% o diversificar ingresos'; tone = 'warn'; }

  const descEpR = Math.round(descPorEp);
  const _insight = {
    title: 'Cuántas descargas necesitás',
    text: `Para llegar a **$${meta.toLocaleString('es-AR')} USD/mes** con un CPM de **$${cpm}** y ${slots} aviso${slots === 1 ? '' : 's'} por episodio, necesitás **${descEpR.toLocaleString('es-AR')} descargas/episodio** (${Math.round(descTotales).toLocaleString('es-AR')}/mes en ${eps} episodios). ${fact}.`,
    tone,
    icon: '🎙️',
  };

  const _chart = {
    type: 'scale',
    marker: descEpR,
    markerLabel: `${descEpR.toLocaleString('es-AR')}/ep`,
    min: 0,
    segments: [
      { nombre: 'Muy factible', max: 1000, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Factible', max: 5000, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Ambicioso', max: 20000, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: 'Top 1%', max: Math.max(40000, Math.ceil(descEpR * 1.15)), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Descargas por episodio necesarias: ${descEpR.toLocaleString('es-AR')}, en zona de factibilidad`,
  };

  return {
    descargasPorEpisodio: `${descEpR.toLocaleString('es-AR')} descargas/episodio`,
    descargasMensuales: `${Math.round(descTotales).toLocaleString('es-AR')} descargas/mes`,
    ingresoPorEpisodio: `$${ingresoEp.toFixed(2)} USD`,
    factibilidad: fact,
    _insight,
    _chart,
  };
}
