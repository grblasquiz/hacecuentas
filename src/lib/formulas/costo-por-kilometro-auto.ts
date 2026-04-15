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

  return {
    costoPorKm: Math.round(costoPorKm),
    costoMensual: Math.round(costoMensual),
    costoAnual: Math.round(costoAnual),
    costoNaftaPorKm: Math.round(costoNaftaPorKm),
    detalle: `Tu auto cuesta $${Math.round(costoPorKm)}/km ($${Math.round(costoMensual).toLocaleString('es-AR')}/mes). Solo nafta: $${Math.round(costoNaftaPorKm)}/km. Total anual: $${Math.round(costoAnual).toLocaleString('es-AR')}.`,
  };
}
