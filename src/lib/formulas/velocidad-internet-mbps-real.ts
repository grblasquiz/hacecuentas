/** Comparación velocidad de internet real vs contratada */
export interface Inputs { velocidadContratada: number; velocidadReal: number; costoMensual?: number; }
export interface Outputs { porcentaje: number; diferenciaMbps: number; costoPorMbps: number; detalle: string; }

export function velocidadInternetMbpsReal(i: Inputs): Outputs {
  const contratada = Number(i.velocidadContratada);
  const real = Number(i.velocidadReal);
  const costo = Number(i.costoMensual || 0);

  if (!contratada || contratada <= 0) throw new Error('Ingresá la velocidad contratada en Mbps');
  if (!real || real <= 0) throw new Error('Ingresá la velocidad real medida en Mbps');

  const porcentaje = (real / contratada) * 100;
  const diferencia = contratada - real;
  const costoPorMbps = costo > 0 ? costo / real : 0;

  let estado: string;
  if (porcentaje >= 90) estado = 'Excelente: tu ISP cumple perfectamente';
  else if (porcentaje >= 80) estado = 'Aceptable: dentro de lo regulado por ENACOM';
  else if (porcentaje >= 70) estado = 'Bajo: podés reclamar a tu ISP';
  else estado = 'Inaceptable: reclamá urgente ante ENACOM';

  const costoTexto = costo > 0 ? ` Pagás $${costoPorMbps.toFixed(2)} por cada Mbps real.` : '';

  return {
    porcentaje: Number(porcentaje.toFixed(1)),
    diferenciaMbps: Number(diferencia.toFixed(1)),
    costoPorMbps: Number(costoPorMbps.toFixed(2)),
    detalle: `Recibís el ${porcentaje.toFixed(1)}% de la velocidad contratada (${real} de ${contratada} Mbps). ${estado}.${costoTexto}`,
  };
}
