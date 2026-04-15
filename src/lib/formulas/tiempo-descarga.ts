/** Tiempo estimado de descarga de archivo */
export interface Inputs { tamanoArchivo: number; unidadTamano?: string; velocidadMbps: number; }
export interface Outputs { tiempoSegundos: number; tiempoFormateado: string; detalle: string; }

export function tiempoDescarga(i: Inputs): Outputs {
  const tamano = Number(i.tamanoArchivo);
  const unidad = String(i.unidadTamano || 'GB');
  const velocidad = Number(i.velocidadMbps);

  if (!tamano || tamano <= 0) throw new Error('Ingresá el tamaño del archivo');
  if (!velocidad || velocidad <= 0) throw new Error('Ingresá la velocidad de internet');

  // Convertir a megabits
  const tamanoMb = unidad === 'GB' ? tamano * 1024 * 8 : tamano * 8;
  const tiempoSeg = tamanoMb / velocidad;

  // Formatear tiempo
  let tiempoStr: string;
  if (tiempoSeg < 60) {
    tiempoStr = `${tiempoSeg.toFixed(1)} segundos`;
  } else if (tiempoSeg < 3600) {
    const min = Math.floor(tiempoSeg / 60);
    const seg = Math.round(tiempoSeg % 60);
    tiempoStr = `${min} min ${seg} seg`;
  } else {
    const hs = Math.floor(tiempoSeg / 3600);
    const min = Math.round((tiempoSeg % 3600) / 60);
    tiempoStr = `${hs} h ${min} min`;
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const mbps = fmt.format(velocidad);
  const mbs = fmt.format(velocidad / 8);

  return {
    tiempoSegundos: Number(tiempoSeg.toFixed(1)),
    tiempoFormateado: tiempoStr,
    detalle: `Un archivo de ${fmt.format(tamano)} ${unidad} a ${mbps} Mbps (${mbs} MB/s) tarda ${tiempoStr} en descargarse.`,
  };
}
