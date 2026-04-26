/** Costo H100/A100 por hora cloud: AWS, GCP, Lambda, RunPod, Vast.ai */
export interface Inputs { horasUso: number; precioPorHoraUsd: number; cantidadGpus: number; descuentoSpotPct: number; horasIdlePorDia: number; }
export interface Outputs { costoTotalUsd: number; costoEfectivoPorHoraUsd: number; ahorroSpotUsd: number; costoIdleUsd: number; explicacion: string; }
export function gpuH100RentaHoraCloudComparativa(i: Inputs): Outputs {
  const horas = Number(i.horasUso);
  const precio = Number(i.precioPorHoraUsd);
  const cantidad = Number(i.cantidadGpus);
  const descuento = Number(i.descuentoSpotPct) / 100;
  const idle = Number(i.horasIdlePorDia);
  if (!horas || horas <= 0) throw new Error('Ingresá las horas de uso');
  if (!precio || precio <= 0) throw new Error('Ingresá el precio por hora');
  if (!cantidad || cantidad <= 0) throw new Error('Ingresá la cantidad de GPUs');
  const precioOnDemand = precio * cantidad;
  const precioEfectivo = precioOnDemand * (1 - descuento);
  const costoTotal = precioEfectivo * horas;
  const ahorroSpot = (precioOnDemand - precioEfectivo) * horas;
  const dias = horas / 24;
  const costoIdle = idle * dias * precioEfectivo;
  return {
    costoTotalUsd: Number(costoTotal.toFixed(2)),
    costoEfectivoPorHoraUsd: Number(precioEfectivo.toFixed(3)),
    ahorroSpotUsd: Number(ahorroSpot.toFixed(2)),
    costoIdleUsd: Number(costoIdle.toFixed(2)),
    explicacion: `${cantidad}× GPU a USD ${precio}/h → USD ${precioEfectivo.toFixed(2)}/h con ${(descuento * 100).toFixed(0)}% descuento. Total ${horas}h: USD ${costoTotal.toFixed(2)}.`,
  };
}
