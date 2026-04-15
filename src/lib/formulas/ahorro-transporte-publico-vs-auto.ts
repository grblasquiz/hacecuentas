/** Ahorro en plata y CO2 de transporte público vs auto */
export interface Inputs { distanciaDiariaKm: number; diasPorMes: number; precioNaftaPorLitro: number; consumoAutoL100km: number; costoEstacionamiento: number; costoBoletoIda: number; }
export interface Outputs { costoAutoMensual: number; costoTransporteMensual: number; ahorroMensual: number; co2AutoKg: number; co2TransporteKg: number; detalle: string; }

export function ahorroTransportePublicoVsAuto(i: Inputs): Outputs {
  const distDiaria = Number(i.distanciaDiariaKm);
  const dias = Number(i.diasPorMes);
  const precioNafta = Number(i.precioNaftaPorLitro);
  const consumo = Number(i.consumoAutoL100km);
  const estacionamiento = Number(i.costoEstacionamiento) || 0;
  const boleto = Number(i.costoBoletoIda);

  if (!distDiaria || distDiaria <= 0) throw new Error('Ingresá la distancia diaria');
  if (!dias || dias <= 0) throw new Error('Ingresá los días por mes');
  if (!precioNafta || precioNafta <= 0) throw new Error('Ingresá el precio de la nafta');
  if (!consumo || consumo <= 0) throw new Error('Ingresá el consumo del auto');
  if (!boleto || boleto <= 0) throw new Error('Ingresá el costo del boleto');

  const kmMes = distDiaria * dias;
  const litros = (kmMes * consumo) / 100;
  const costoNafta = litros * precioNafta;
  const costoAuto = costoNafta + estacionamiento;
  const costoTransporte = boleto * 2 * dias;
  const ahorro = costoAuto - costoTransporte;

  const co2Auto = litros * 2.31;
  const co2Transporte = kmMes * 0.05;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    costoAutoMensual: Number(costoAuto.toFixed(0)),
    costoTransporteMensual: Number(costoTransporte.toFixed(0)),
    ahorroMensual: Number(ahorro.toFixed(0)),
    co2AutoKg: Number(co2Auto.toFixed(1)),
    co2TransporteKg: Number(co2Transporte.toFixed(1)),
    detalle: `Auto: $${fmt.format(costoAuto)}/mes (${fmt.format(co2Auto)} kg CO2). Transporte público: $${fmt.format(costoTransporte)}/mes (${fmt.format(co2Transporte)} kg CO2). Ahorro: $${fmt.format(ahorro)}/mes y ${fmt.format(co2Auto - co2Transporte)} kg menos de CO2.`,
  };
}
