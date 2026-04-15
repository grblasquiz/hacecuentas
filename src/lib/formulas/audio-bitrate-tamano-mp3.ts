/** Cálculo de tamaño de archivo de audio por bitrate y duración */
export interface Inputs { duracionMinutos: number; bitrateKbps: number; }
export interface Outputs { tamanoMb: number; tamanoKb: number; cancionesEn1gb: number; detalle: string; }

export function audioBitrateTamanoMp3(i: Inputs): Outputs {
  const duracion = Number(i.duracionMinutos);
  const bitrate = Number(i.bitrateKbps);

  if (!duracion || duracion <= 0) throw new Error('Ingresá la duración en minutos');
  if (!bitrate || bitrate <= 0) throw new Error('Ingresá el bitrate en kbps');

  const segundos = duracion * 60;
  const tamanoKb = (bitrate * segundos) / 8;
  const tamanoMb = tamanoKb / 1000;
  const cancionesEn1gb = tamanoMb > 0 ? Math.floor(1000 / tamanoMb) : 0;

  return {
    tamanoMb: Number(tamanoMb.toFixed(2)),
    tamanoKb: Math.round(tamanoKb),
    cancionesEn1gb,
    detalle: `Audio de ${duracion} min a ${bitrate} kbps = ${tamanoMb.toFixed(2)} MB (${Math.round(tamanoKb)} KB). En 1 GB caben ~${cancionesEn1gb} archivos de esta duración.`,
  };
}
