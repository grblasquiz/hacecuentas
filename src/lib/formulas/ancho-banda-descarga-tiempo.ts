/** Tiempo de descarga según ancho de banda y tamaño de archivo */
export interface Inputs { tamanoMb: number; velocidadMbps: number; eficiencia?: number; }
export interface Outputs { segundos: number; minutos: number; horas: number; detalle: string; }

export function anchoBandaDescargaTiempo(i: Inputs): Outputs {
  const tamano = Number(i.tamanoMb);
  const velocidad = Number(i.velocidadMbps);
  const eficiencia = Number(i.eficiencia || 85) / 100;

  if (!tamano || tamano <= 0) throw new Error('Ingresá un tamaño de archivo válido en MB');
  if (!velocidad || velocidad <= 0) throw new Error('Ingresá una velocidad válida en Mbps');
  if (eficiencia <= 0 || eficiencia > 1) throw new Error('La eficiencia debe estar entre 1 y 100');

  const velocidadRealMbps = velocidad * eficiencia;
  const velocidadMBs = velocidadRealMbps / 8;
  const segundos = tamano / velocidadMBs;
  const minutos = segundos / 60;
  const horas = minutos / 60;

  let tiempoTexto: string;
  if (segundos < 60) tiempoTexto = `${segundos.toFixed(1)} segundos`;
  else if (minutos < 60) tiempoTexto = `${minutos.toFixed(1)} minutos`;
  else tiempoTexto = `${horas.toFixed(2)} horas`;

  return {
    segundos: Number(segundos.toFixed(1)),
    minutos: Number(minutos.toFixed(2)),
    horas: Number(horas.toFixed(3)),
    detalle: `Un archivo de ${tamano} MB con ${velocidad} Mbps (${(eficiencia * 100).toFixed(0)}% eficiencia) tarda ~${tiempoTexto}. Velocidad real: ${velocidadMBs.toFixed(2)} MB/s.`,
  };
}
