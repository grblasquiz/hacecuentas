/** Cálculo de tamaño de archivo de video por bitrate y duración */
export interface Inputs { duracionMinutos: number; bitrateVideoMbps: number; bitrateAudioKbps?: number; }
export interface Outputs { tamanoMb: number; tamanoGb: number; tamanoVideoMb: number; tamanoAudioMb: number; detalle: string; _insight?: any; _chart?: any; }

export function videoBitrateTamanoArchivo(i: Inputs): Outputs {
  const duracion = Number(i.duracionMinutos);
  const bitrateVideo = Number(i.bitrateVideoMbps);
  const bitrateAudio = Number(i.bitrateAudioKbps || 192);

  if (!duracion || duracion <= 0) throw new Error('Ingresá la duración del video en minutos');
  if (!bitrateVideo || bitrateVideo <= 0) throw new Error('Ingresá el bitrate de video en Mbps');
  if (bitrateAudio < 0) throw new Error('El bitrate de audio no puede ser negativo');

  const segundos = duracion * 60;
  const tamanoVideoMb = (bitrateVideo * segundos) / 8;
  const tamanoAudioMb = (bitrateAudio / 1000 * segundos) / 8;
  const tamanoTotalMb = tamanoVideoMb + tamanoAudioMb;
  const tamanoGb = tamanoTotalMb / 1024;

  const videoR = Number(tamanoVideoMb.toFixed(1));
  const audioR = Number(tamanoAudioMb.toFixed(1));
  const totalR = Number(tamanoTotalMb.toFixed(1));
  const pctVideo = tamanoTotalMb > 0 ? Math.round((tamanoVideoMb / tamanoTotalMb) * 100) : 0;
  const _insight = {
    title: 'Tamaño del archivo',
    text: tamanoTotalMb >= 1024
      ? `Un video de **${duracion} min** a **${bitrateVideo} Mbps** pesa **${tamanoGb.toFixed(2)} GB** (${totalR.toLocaleString('es-AR')} MB). El video se lleva el **${pctVideo}%**; bajar el bitrate es lo que más reduce el tamaño.`
      : `Un video de **${duracion} min** a **${bitrateVideo} Mbps** pesa **${totalR.toLocaleString('es-AR')} MB** (${tamanoGb.toFixed(2)} GB). El video se lleva el **${pctVideo}%** y el audio el resto.`,
    tone: 'neutral',
    icon: '🎬',
  };
  const slices = [{ label: 'Video', value: videoR }];
  if (audioR > 0) slices.push({ label: 'Audio', value: audioR });
  const _chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '',
    centerValue: `${(videoR + audioR).toLocaleString('es-AR')} MB`,
    centerLabel: 'Tamaño total',
    ariaLabel: 'Composición del tamaño del archivo de video: pista de video más audio',
  };
  return {
    tamanoMb: totalR,
    tamanoGb: Number(tamanoGb.toFixed(3)),
    tamanoVideoMb: videoR,
    tamanoAudioMb: audioR,
    detalle: `Video de ${duracion} min a ${bitrateVideo} Mbps + audio ${bitrateAudio} kbps = ${tamanoTotalMb.toFixed(1)} MB (${tamanoGb.toFixed(2)} GB). Video: ${tamanoVideoMb.toFixed(1)} MB, Audio: ${tamanoAudioMb.toFixed(1)} MB.`,
    _insight,
    _chart,
  };
}
