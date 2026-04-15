/** Calcula el costo total de propiedad (TCO) anual de un auto */
export interface Inputs {
  gastoNaftaAnual: number;
  seguroAnual: number;
  patenteAnual: number;
  serviceAnual: number;
  neumaticosAnual?: number;
  cocheraAnual?: number;
  depreciacionAnual?: number;
  otrosGastos?: number;
}
export interface Outputs {
  costoAnualTotal: number;
  costoMensual: number;
  costoDiario: number;
  detalle: string;
}

export function costoTotalPropiedadAutoAnual(i: Inputs): Outputs {
  const nafta = Number(i.gastoNaftaAnual) || 0;
  const seguro = Number(i.seguroAnual) || 0;
  const patente = Number(i.patenteAnual) || 0;
  const service = Number(i.serviceAnual) || 0;
  const neumaticos = Number(i.neumaticosAnual) || 0;
  const cochera = Number(i.cocheraAnual) || 0;
  const depreciacion = Number(i.depreciacionAnual) || 0;
  const otros = Number(i.otrosGastos) || 0;

  const costoAnualTotal = nafta + seguro + patente + service + neumaticos + cochera + depreciacion + otros;

  if (costoAnualTotal <= 0) throw new Error('Ingresá al menos un gasto para calcular el TCO');

  const costoMensual = costoAnualTotal / 12;
  const costoDiario = costoAnualTotal / 365;

  // Desglose porcentual
  const items = [
    { nombre: 'Nafta', valor: nafta },
    { nombre: 'Seguro', valor: seguro },
    { nombre: 'Patente', valor: patente },
    { nombre: 'Service', valor: service },
    { nombre: 'Neumáticos', valor: neumaticos },
    { nombre: 'Cochera', valor: cochera },
    { nombre: 'Depreciación', valor: depreciacion },
    { nombre: 'Otros', valor: otros },
  ].filter(x => x.valor > 0);

  const desglose = items
    .map(x => `${x.nombre}: $${Math.round(x.valor).toLocaleString('es-AR')} (${((x.valor / costoAnualTotal) * 100).toFixed(0)}%)`)
    .join('. ');

  return {
    costoAnualTotal: Math.round(costoAnualTotal),
    costoMensual: Math.round(costoMensual),
    costoDiario: Math.round(costoDiario),
    detalle: `TCO anual: $${Math.round(costoAnualTotal).toLocaleString('es-AR')} ($${Math.round(costoMensual).toLocaleString('es-AR')}/mes, $${Math.round(costoDiario).toLocaleString('es-AR')}/día). ${desglose}.`,
  };
}
