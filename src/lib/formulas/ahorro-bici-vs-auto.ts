/** Ahorro mensual de ir en bici vs auto */
export interface Inputs { distanciaDiariaKm: number; diasPorMes: number; precioNaftaPorLitro: number; consumoAutoLPor100km: number; costoEstacionamiento: number; }
export interface Outputs { costoAutoMensual: number; costoBiciMensual: number; ahorroMensual: number; ahorroAnual: number; detalle: string; }

export function ahorroBiciVsAuto(i: Inputs): Outputs {
  const distDiaria = Number(i.distanciaDiariaKm);
  const dias = Number(i.diasPorMes);
  const precioNafta = Number(i.precioNaftaPorLitro);
  const consumo = Number(i.consumoAutoLPor100km);
  const estacionamiento = Number(i.costoEstacionamiento) || 0;

  if (!distDiaria || distDiaria <= 0) throw new Error('Ingresá la distancia diaria');
  if (!dias || dias <= 0) throw new Error('Ingresá los días por mes');
  if (!precioNafta || precioNafta <= 0) throw new Error('Ingresá el precio de la nafta');
  if (!consumo || consumo <= 0) throw new Error('Ingresá el consumo del auto');

  const kmMes = distDiaria * dias;
  const litros = (kmMes * consumo) / 100;
  const costoNafta = litros * precioNafta;
  const costoAuto = costoNafta + estacionamiento;
  const costoBici = 10000; // Mantenimiento estimado mensual
  const ahorro = costoAuto - costoBici;
  const ahorroAnual = ahorro * 12;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    costoAutoMensual: Number(costoAuto.toFixed(0)),
    costoBiciMensual: costoBici,
    ahorroMensual: Number(ahorro.toFixed(0)),
    ahorroAnual: Number(ahorroAnual.toFixed(0)),
    detalle: `${fmt.format(kmMes)} km/mes × ${fmt.format(consumo)} L/100km = ${fmt.format(litros)} L × $${fmt.format(precioNafta)} = $${fmt.format(costoNafta)} nafta + $${fmt.format(estacionamiento)} estacionamiento = $${fmt.format(costoAuto)} auto vs $${fmt.format(costoBici)} bici. Ahorrás $${fmt.format(ahorro)}/mes.`,
  };
}
