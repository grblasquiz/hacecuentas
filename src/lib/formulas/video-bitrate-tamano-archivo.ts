/** Cálculo de tamaño de archivo de video por bitrate y duración */
export interface Inputs { duracionMinutos: number; bitrateVideoMbps: number; bitrateAudioKbps?: number; }
export interface Outputs { tamanoMb: number; tamanoGb: number; tamanoVideoMb: number; tamanoAudioMb: number; detalle: string; }

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

  return {
    tamanoMb: Number(tamanoTotalMb.toFixed(1)),
    tamanoGb: Number(tamanoGb.toFixed(3)),
    tamanoVideoMb: Number(tamanoVideoMb.toFixed(1)),
    tamanoAudioMb: Number(tamanoAudioMb.toFixed(1)),
    detalle: `Video de ${duracion} min a ${bitrateVideo} Mbps + audio ${bitrateAudio} kbps = ${tamanoTotalMb.toFixed(1)} MB (${tamanoGb.toFixed(2)} GB). Video: ${tamanoVideoMb.toFixed(1)} MB, Audio: ${tamanoAudioMb.toFixed(1)} MB.`,
  };
}
