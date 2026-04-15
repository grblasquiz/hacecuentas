/** Cálculo de consumo eléctrico de PC gamer y costo mensual */
export interface Inputs { wattsGpu: number; wattsCpu: number; wattsResto?: number; horasDia: number; precioKwh: number; }
export interface Outputs { consumoTotalWatts: number; kwhMensual: number; costoMensual: number; detalle: string; }

export function consumoElectricoPcGamerWatts(i: Inputs): Outputs {
  const gpu = Number(i.wattsGpu);
  const cpu = Number(i.wattsCpu);
  const resto = Number(i.wattsResto || 100);
  const horas = Number(i.horasDia);
  const precioKwh = Number(i.precioKwh);

  if (!gpu && gpu !== 0) throw new Error('Ingresá el consumo de la GPU en watts');
  if (!cpu && cpu !== 0) throw new Error('Ingresá el consumo del CPU en watts');
  if (!horas || horas <= 0) throw new Error('Ingresá las horas de uso por día');
  if (!precioKwh || precioKwh <= 0) throw new Error('Ingresá el precio del kWh');

  const totalWatts = gpu + cpu + resto;
  const kwhDiario = (totalWatts * horas) / 1000;
  const kwhMensual = kwhDiario * 30;
  const costoMensual = kwhMensual * precioKwh;

  return {
    consumoTotalWatts: totalWatts,
    kwhMensual: Number(kwhMensual.toFixed(1)),
    costoMensual: Number(costoMensual.toFixed(0)),
    detalle: `PC de ${totalWatts}W (GPU ${gpu}W + CPU ${cpu}W + resto ${resto}W) × ${horas} hs/día = ${kwhMensual.toFixed(1)} kWh/mes. Costo: $${costoMensual.toFixed(0)}/mes a $${precioKwh}/kWh.`,
  };
}
