/** Litros de nafta necesarios para un viaje por ruta */
export interface LitrosNaftaViajeInputs {
  distanciaKm: number;
  consumoPor100km: number;
  precioNaftaPorLitro: number;
}
export interface LitrosNaftaViajeOutputs {
  litrosNecesarios: number;
  costoTotal: number;
  costoPorKm: number;
  detalle: string;
}

export function litrosNaftaViaje(inputs: LitrosNaftaViajeInputs): LitrosNaftaViajeOutputs {
  const distancia = Number(inputs.distanciaKm);
  const consumo = Number(inputs.consumoPor100km);
  const precio = Number(inputs.precioNaftaPorLitro);

  if (!distancia || distancia <= 0) throw new Error('Ingresá la distancia del viaje en km');
  if (!consumo || consumo <= 0) throw new Error('Ingresá el consumo en L/100 km');
  if (!precio || precio <= 0) throw new Error('Ingresá el precio del litro de nafta');

  const litros = Number(((distancia * consumo) / 100).toFixed(1));
  const costoTotal = Number((litros * precio).toFixed(0));
  const costoPorKm = Number(((precio * consumo) / 100).toFixed(1));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    litrosNecesarios: litros,
    costoTotal,
    costoPorKm,
    detalle: `${fmt.format(distancia)} km × ${fmt.format(consumo)} L/100km = ${fmt.format(litros)} litros × $${fmt.format(precio)}/L = $${fmt.format(costoTotal)} total ($${fmt.format(costoPorKm)}/km).`,
  };
}
