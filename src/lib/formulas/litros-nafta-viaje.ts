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
  _insight?: any;
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

  const insight = {
    title: 'Costo del viaje',
    text: `Para recorrer **${fmt.format(distancia)} km** vas a gastar **${fmt.format(litros)} litros** de nafta, unos **$${fmt.format(costoTotal)}** en total (**$${fmt.format(costoPorKm)}/km**). Si vas con 3 acompañantes y dividen, son **$${fmt.format(Math.round(costoTotal / 4))}** por cabeza.`,
    tone: 'neutral',
    icon: '🚗',
  };

  return {
    litrosNecesarios: litros,
    costoTotal,
    costoPorKm,
    detalle: `${fmt.format(distancia)} km × ${fmt.format(consumo)} L/100km = ${fmt.format(litros)} litros × $${fmt.format(precio)}/L = $${fmt.format(costoTotal)} total ($${fmt.format(costoPorKm)}/km).`,
    _insight: insight,
  };
}
