/** Watch Time YouTube */
export interface Inputs { horasActuales: number; duracionVideo: number; vistasPorVideo: number; retencion: number; }
export interface Outputs { horasFaltantes: number; videosNecesarios: string; watchTimePorVideo: string; porcentaje: string; _insight?: any; _chart?: any; }

export function youtubeWatchTimeHorasSubir(i: Inputs): Outputs {
  const horas = Number(i.horasActuales) || 0;
  const dur = Number(i.duracionVideo);
  const vistas = Number(i.vistasPorVideo);
  const ret = Number(i.retencion);
  if (dur <= 0 || vistas <= 0 || ret <= 0) throw new Error('Ingresá valores válidos');
  const META = 4000;
  const faltantes = Math.max(0, META - horas);
  const wtPorVideo = (dur * (ret / 100)) / 60 * vistas;
  const videos = wtPorVideo > 0 ? Math.ceil(faltantes / wtPorVideo) : 0;
  const pct = Math.min(100, (horas / META) * 100);

  const listo = faltantes === 0;
  const _insight = {
    title: listo ? 'Meta de horas alcanzada' : 'Cuánto te falta para las 4.000 horas',
    text: listo
      ? `Ya superás las **4.000 horas** de reproducción (vas por **${horas.toLocaleString('es-AR')} h**): ese requisito de monetización está cumplido.`
      : `Llevás **${pct.toFixed(0)}%** del camino: te faltan **${faltantes.toLocaleString('es-AR')} horas**, unos **${videos} videos** más al ritmo de **${wtPorVideo.toFixed(1)} h** de watch time por video.`,
    tone: listo ? 'good' : (pct >= 75 ? 'good' : pct >= 40 ? 'neutral' : 'warn'),
    icon: '⏱️',
  };

  const _chart = {
    type: 'scale' as const,
    marker: Number(pct.toFixed(1)),
    markerLabel: `Vas ${pct.toFixed(0)}% (${horas.toLocaleString('es-AR')} h)`,
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Arrancando', max: 40, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'A mitad de camino', max: 75, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Casi listo', max: 100, color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: 'Progreso hacia las 4.000 horas de reproducción para monetizar en YouTube',
  };

  return {
    horasFaltantes: Number(faltantes.toFixed(1)),
    videosNecesarios: faltantes === 0 ? 'Ya llegaste a 4.000 horas' : `${videos} videos nuevos`,
    watchTimePorVideo: `${wtPorVideo.toFixed(1)} horas por video`,
    porcentaje: `${pct.toFixed(1)}%`,
    _insight,
    _chart,
  };
}
