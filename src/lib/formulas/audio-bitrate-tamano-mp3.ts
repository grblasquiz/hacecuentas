/** Cálculo de tamaño de archivo de audio por bitrate y duración */
export interface Inputs { duracionMinutos: number; bitrateKbps: number; }
export interface Outputs { tamanoMb: number; tamanoKb: number; cancionesEn1gb: number; detalle: string; _insight?: any; }

export function audioBitrateTamanoMp3(i: Inputs): Outputs {
  const duracion = Number(i.duracionMinutos);
  const bitrate = Number(i.bitrateKbps);

  if (!duracion || duracion <= 0) throw new Error('Ingresá la duración en minutos');
  if (!bitrate || bitrate <= 0) throw new Error('Ingresá el bitrate en kbps');

  const segundos = duracion * 60;
  const tamanoKb = (bitrate * segundos) / 8;
  const tamanoMb = tamanoKb / 1000;
  const cancionesEn1gb = tamanoMb > 0 ? Math.floor(1000 / tamanoMb) : 0;

  const calidad = bitrate <= 96 ? 'compresión fuerte (voz/podcast)'
    : bitrate < 192 ? 'calidad estándar de streaming'
    : bitrate < 320 ? 'alta calidad'
    : 'máxima calidad MP3';
  const _insight = {
    title: `${tamanoMb.toFixed(1)} MB por archivo`,
    text: `A **${bitrate} kbps** (${calidad}), ${duracion} min ocupan **${tamanoMb.toFixed(2)} MB**. En **1 GB entran ~${cancionesEn1gb} archivos** de esta duración. Cada paso de bitrate sube el tamaño en proporción directa.`,
    tone: 'neutral' as const,
    icon: '🎵',
  };

  return {
    tamanoMb: Number(tamanoMb.toFixed(2)),
    tamanoKb: Math.round(tamanoKb),
    cancionesEn1gb,
    detalle: `Audio de ${duracion} min a ${bitrate} kbps = ${tamanoMb.toFixed(2)} MB (${Math.round(tamanoKb)} KB). En 1 GB caben ~${cancionesEn1gb} archivos de esta duración.`,
    _insight,
  };
}
