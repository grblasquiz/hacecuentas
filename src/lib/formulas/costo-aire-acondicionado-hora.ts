/** Costo del aire acondicionado por hora */
export interface Inputs { frigorias: string; wattsCustom?: number; esInverter?: string; horasDia: number; precioKwh: number; }
export interface Outputs { costoHora: number; costoDia: number; costoMes: number; consumoKwhMes: string; }

export function costoAireAcondicionadoHora(i: Inputs): Outputs {
  const hsDia = Number(i.horasDia);
  const precio = Number(i.precioKwh);
  const inverter = i.esInverter === 'si';
  if (!hsDia || hsDia <= 0) throw new Error('Ingresá las horas de uso');
  if (!precio || precio <= 0) throw new Error('Ingresá el precio del kWh');

  const wattsMap: Record<string, number> = { '2200': 1000, '3000': 1400, '4500': 2000, '6000': 2800 };
  let watts: number;
  if (i.frigorias === 'custom') {
    watts = Number(i.wattsCustom) || 1400;
  } else {
    watts = wattsMap[i.frigorias] || 1400;
  }
  if (inverter) watts *= 0.62;

  const kwhHora = watts / 1000;
  const costoHora = kwhHora * precio;
  const costoDia = costoHora * hsDia;
  const costoMes = costoDia * 30;
  const kwhMes = kwhHora * hsDia * 30;

  return {
    costoHora: Math.round(costoHora),
    costoDia: Math.round(costoDia),
    costoMes: Math.round(costoMes),
    consumoKwhMes: `${kwhMes.toFixed(1)} kWh/mes`,
  };
}
