/** Costo por kilómetro del auto */
export interface Inputs { kmMensuales: number; consumoKm: number; precioNafta: number; seguroMensual?: number; patenteMensual?: number; mantenimientoMes?: number; estacionamientoMes?: number; }
export interface Outputs { costoPorKm: number; costoMensualTotal: number; costoNaftaMes: number; costosFijosMes: number; }

export function costoKmAuto(i: Inputs): Outputs {
  const km = Number(i.kmMensuales);
  const consumo = Number(i.consumoKm);
  const nafta = Number(i.precioNafta);
  if (!km || km <= 0) throw new Error('Ingresá los km mensuales');
  if (!consumo || consumo <= 0) throw new Error('Ingresá el consumo en km/L');
  if (!nafta || nafta <= 0) throw new Error('Ingresá el precio de la nafta');

  const litrosMes = km / consumo;
  const costoNaftaMes = litrosMes * nafta;
  const seguro = Number(i.seguroMensual) || 0;
  const patente = Number(i.patenteMensual) || 0;
  const mant = Number(i.mantenimientoMes) || 0;
  const estac = Number(i.estacionamientoMes) || 0;
  const costosFijosMes = seguro + patente + mant + estac;
  const costoMensualTotal = costoNaftaMes + costosFijosMes;
  const costoPorKm = costoMensualTotal / km;

  return {
    costoPorKm: Math.round(costoPorKm),
    costoMensualTotal: Math.round(costoMensualTotal),
    costoNaftaMes: Math.round(costoNaftaMes),
    costosFijosMes: Math.round(costosFijosMes),
  };
}
