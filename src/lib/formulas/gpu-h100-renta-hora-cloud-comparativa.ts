/** Costo H100/A100 por hora cloud: AWS, GCP, Lambda, RunPod, Vast.ai */
export interface Inputs { horasUso: number; precioPorHoraUsd: number; cantidadGpus: number; descuentoSpotPct: number; horasIdlePorDia: number; }
export interface Outputs { costoTotalUsd: number; costoEfectivoPorHoraUsd: number; ahorroSpotUsd: number; costoIdleUsd: number; explicacion: string; _insight?: any; }
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

  const pctIdle = costoTotal > 0 ? (costoIdle / costoTotal) * 100 : 0;
  let _insight: any;
  if (costoIdle > 0 && pctIdle >= 15) {
    _insight = {
      title: 'Ojo con el tiempo ocioso',
      text: `Estás pagando **USD ${costoIdle.toFixed(2)}** por GPUs encendidas sin usar (${pctIdle.toFixed(0)}% del total de USD ${costoTotal.toFixed(2)}). Apagar o liberar en idle es tu mayor palanca de ahorro.`,
      tone: 'warn',
      icon: '🖥️',
    };
  } else if (ahorroSpot > 0) {
    _insight = {
      title: 'Spot rinde',
      text: `El descuento spot del ${(descuento * 100).toFixed(0)}% te ahorra **USD ${ahorroSpot.toFixed(2)}** sobre las ${horas} h, dejando el total en **USD ${costoTotal.toFixed(2)}**.`,
      tone: 'good',
      icon: '🖥️',
    };
  } else {
    _insight = {
      title: 'Costo de cómputo',
      text: `${cantidad}× GPU durante ${horas} h suman **USD ${costoTotal.toFixed(2)}** a USD ${precioEfectivo.toFixed(2)}/h efectivos. Activá spot para recortar el gasto.`,
      tone: 'neutral',
      icon: '🖥️',
    };
  }

  return {
    costoTotalUsd: Number(costoTotal.toFixed(2)),
    costoEfectivoPorHoraUsd: Number(precioEfectivo.toFixed(3)),
    ahorroSpotUsd: Number(ahorroSpot.toFixed(2)),
    costoIdleUsd: Number(costoIdle.toFixed(2)),
    explicacion: `${cantidad}× GPU a USD ${precio}/h → USD ${precioEfectivo.toFixed(2)}/h con ${(descuento * 100).toFixed(0)}% descuento. Total ${horas}h: USD ${costoTotal.toFixed(2)}.`,
    _insight,
  };
}
