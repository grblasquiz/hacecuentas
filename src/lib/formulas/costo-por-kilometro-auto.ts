/** Calcula el costo total por kilómetro recorrido en auto */
export interface Inputs {
  kmAnuales: number;
  consumoL100km: number;
  precioLitro: number;
  seguroAnual: number;
  patenteAnual: number;
  serviceAnual: number;
  depreciacionAnual?: number;
}
export interface Outputs {
  costoPorKm: number;
  costoMensual: number;
  costoAnual: number;
  costoNaftaPorKm: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function costoPorKilometroAuto(i: Inputs): Outputs {
  const km = Number(i.kmAnuales);
  const consumo = Number(i.consumoL100km);
  const precio = Number(i.precioLitro);
  const seguro = Number(i.seguroAnual);
  const patente = Number(i.patenteAnual);
  const service = Number(i.serviceAnual);
  const depreciacion = Number(i.depreciacionAnual) || 0;

  if (!km || km < 1000) throw new Error('Ingresá los km anuales (mínimo 1.000)');
  if (!consumo || consumo <= 0) throw new Error('Ingresá el consumo en L/100km');
  if (!precio || precio <= 0) throw new Error('Ingresá el precio del litro de nafta');

  const gastoNaftaAnual = (km * consumo / 100) * precio;
  const costoAnual = gastoNaftaAnual + seguro + patente + service + depreciacion;
  const costoPorKm = costoAnual / km;
  const costoMensual = costoAnual / 12;
  const costoNaftaPorKm = (consumo / 100) * precio;

  const pctNafta = costoAnual > 0 ? (gastoNaftaAnual / costoAnual) * 100 : 0;
  const pctFijos = 100 - pctNafta;

  const _insight = {
    title: pctFijos >= pctNafta ? 'Mandan los costos fijos' : 'Manda la nafta',
    text: pctFijos >= pctNafta
      ? `Mantener el auto te cuesta **$${Math.round(costoPorKm).toLocaleString('es-AR')}/km**, pero solo **$${Math.round(costoNaftaPorKm).toLocaleString('es-AR')}/km** es nafta: el **${pctFijos.toFixed(0)}%** son gastos fijos (seguro, patente, service${depreciacion > 0 ? ', depreciación' : ''}) que pagás manejes o no. Cuantos más km hagas, más bajo el costo por km.`
      : `De los **$${Math.round(costoPorKm).toLocaleString('es-AR')}/km** que te cuesta el auto, el **${pctNafta.toFixed(0)}%** es nafta (**$${Math.round(costoNaftaPorKm).toLocaleString('es-AR')}/km**). El combustible domina tu costo, así que mejorar el consumo o el precio del litro mueve la aguja directo.`,
    tone: 'neutral',
    icon: '🚗',
  };

  const slices = [
    { label: 'Nafta', value: Math.round(gastoNaftaAnual) },
    { label: 'Seguro', value: Math.round(seguro) },
    { label: 'Patente', value: Math.round(patente) },
    { label: 'Service', value: Math.round(service) },
  ];
  if (depreciacion > 0) slices.push({ label: 'Depreciación', value: Math.round(depreciacion) });
  const _chart = {
    type: 'doughnut',
    slices: slices.filter((s) => s.value > 0),
    prefix: '$',
    centerValue: `$${Math.round(costoAnual).toLocaleString('es-AR')}`,
    centerLabel: 'Costo anual',
    ariaLabel: `Composición del costo anual del auto: nafta ${pctNafta.toFixed(0)}% y costos fijos ${pctFijos.toFixed(0)}%`,
  };

  return {
    costoPorKm: Math.round(costoPorKm),
    costoMensual: Math.round(costoMensual),
    costoAnual: Math.round(costoAnual),
    costoNaftaPorKm: Math.round(costoNaftaPorKm),
    detalle: `Tu auto cuesta $${Math.round(costoPorKm)}/km ($${Math.round(costoMensual).toLocaleString('es-AR')}/mes). Solo nafta: $${Math.round(costoNaftaPorKm)}/km. Total anual: $${Math.round(costoAnual).toLocaleString('es-AR')}.`,
    _insight,
    _chart,
  };
}
