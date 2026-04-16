/** Huella digital - estimación de datos generados */
export interface Inputs { emailsDia: number; redesSocialesHoras: number; streamingHoras: number; fotosVideo: number; busquedas: number; }
export interface Outputs { datosDiariosMb: number; datosAnualesGb: number; valorDatos: string; mensaje: string; }

export function huellaDigitalEstimacion(i: Inputs): Outputs {
  const emails = Number(i.emailsDia) || 0;
  const redes = Number(i.redesSocialesHoras) || 0;
  const streaming = Number(i.streamingHoras) || 0;
  const fotos = Number(i.fotosVideo) || 0;
  const busquedas = Number(i.busquedas) || 0;

  // Estimates in MB
  const mbEmails = emails * 0.075; // avg 75 KB per email
  const mbRedes = redes * 150; // ~150 MB/hr scrolling
  const mbStreaming = streaming * 1500; // ~1.5 GB/hr HD
  const mbFotos = fotos * 4; // ~4 MB per photo
  const mbBusquedas = busquedas * 0.2; // ~200 KB per search (metadata)
  const mbMetadata = 50; // background location, telemetry, etc.

  const datosDiariosMb = Math.round(mbEmails + mbRedes + mbStreaming + mbFotos + mbBusquedas + mbMetadata);
  const datosAnualesGb = Math.round((datosDiariosMb * 365) / 1024);

  // Rough value estimation
  const valorAnual = (datosAnualesGb * 0.05).toFixed(2);
  const valorDatos = `~$${valorAnual} USD/año para anunciantes (valor del dato puro, sin contar valor de plataforma)`;

  return {
    datosDiariosMb,
    datosAnualesGb,
    valorDatos,
    mensaje: `Generás ~${datosDiariosMb} MB/día de datos (${datosAnualesGb} GB/año). Streaming: ${Math.round(mbStreaming)} MB, redes: ${Math.round(mbRedes)} MB, resto: ${Math.round(mbEmails + mbFotos + mbBusquedas + mbMetadata)} MB.`
  };
}