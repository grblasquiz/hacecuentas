/** Watch Time YouTube */
export interface Inputs { horasActuales: number; duracionVideo: number; vistasPorVideo: number; retencion: number; }
export interface Outputs { horasFaltantes: number; videosNecesarios: string; watchTimePorVideo: string; porcentaje: string; }

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
  return {
    horasFaltantes: Number(faltantes.toFixed(1)),
    videosNecesarios: faltantes === 0 ? 'Ya llegaste a 4.000 horas' : `${videos} videos nuevos`,
    watchTimePorVideo: `${wtPorVideo.toFixed(1)} horas por video`,
    porcentaje: `${pct.toFixed(1)}%`,
  };
}
