/** Consumo eléctrico de un electrodoméstico */
export interface Inputs { potenciaWatts: number; horasDia: number; diasMes?: number; precioKwh: number; }
export interface Outputs { consumoMensualKwh: string; costoMensual: number; costoAnual: number; consumoDiarioKwh: string; }

export function consumoElectricidadElectrodomestico(i: Inputs): Outputs {
  const watts = Number(i.potenciaWatts);
  const hsDia = Number(i.horasDia);
  const dias = Number(i.diasMes) || 30;
  const precio = Number(i.precioKwh);
  if (!watts || watts <= 0) throw new Error('Ingresá la potencia en watts');
  if (!hsDia || hsDia <= 0) throw new Error('Ingresá las horas de uso por día');
  if (!precio || precio <= 0) throw new Error('Ingresá el precio del kWh');

  const kwhDia = (watts * hsDia) / 1000;
  const kwhMes = kwhDia * dias;
  const costoMensual = kwhMes * precio;
  const costoAnual = costoMensual * 12;

  return {
    consumoMensualKwh: `${kwhMes.toFixed(1)} kWh/mes`,
    costoMensual: Math.round(costoMensual),
    costoAnual: Math.round(costoAnual),
    consumoDiarioKwh: `${kwhDia.toFixed(2)} kWh/día`,
  };
}
