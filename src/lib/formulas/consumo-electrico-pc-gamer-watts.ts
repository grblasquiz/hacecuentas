/** Cálculo de consumo eléctrico de PC gamer y costo mensual */
export interface Inputs { wattsGpu: number; wattsCpu: number; wattsResto?: number; horasDia: number; precioKwh: number; }
export interface Outputs { consumoTotalWatts: number; kwhMensual: number; costoMensual: number; detalle: string; _insight?: any; _chart?: any; }

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

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const componentes: [string, number][] = [['la GPU', gpu], ['el CPU', cpu], ['el resto', resto]];
  componentes.sort((a, b) => b[1] - a[1]);
  const dominante = componentes[0][0];
  const pctDominante = totalWatts > 0 ? Math.round((componentes[0][1] / totalWatts) * 100) : 0;
  const insightText = totalWatts >= 500
    ? `Equipo de **${totalWatts} W**: bastante exigente. Jugando ${horas} h/día son **${kwhMensual.toFixed(1)} kWh/mes** (~$${fmt.format(Math.round(costoMensual))}). **${dominante.charAt(0).toUpperCase() + dominante.slice(1)}** se lleva el **${pctDominante}%** del consumo.`
    : `Equipo de **${totalWatts} W**. A ${horas} h/día gasta **${kwhMensual.toFixed(1)} kWh/mes** (~$${fmt.format(Math.round(costoMensual))}). El mayor consumo viene de **${dominante}** (**${pctDominante}%**).`;

  const slices = [
    { label: 'GPU', value: gpu },
    { label: 'CPU', value: cpu },
    { label: 'Resto (placa, RAM, disco, fans)', value: resto },
  ].filter((s) => s.value > 0);

  return {
    consumoTotalWatts: totalWatts,
    kwhMensual: Number(kwhMensual.toFixed(1)),
    costoMensual: Number(costoMensual.toFixed(0)),
    detalle: `PC de ${totalWatts}W (GPU ${gpu}W + CPU ${cpu}W + resto ${resto}W) × ${horas} hs/día = ${kwhMensual.toFixed(1)} kWh/mes. Costo: $${costoMensual.toFixed(0)}/mes a $${precioKwh}/kWh.`,
    _insight: {
      title: 'De dónde sale el consumo',
      text: insightText,
      tone: totalWatts >= 500 ? 'warn' : 'neutral',
      icon: '🖥️',
    },
    _chart: {
      type: 'doughnut',
      slices,
      prefix: '',
      centerValue: `${totalWatts} W`,
      centerLabel: 'consumo total',
      ariaLabel: `Reparto del consumo de la PC: GPU ${gpu} W, CPU ${cpu} W, resto ${resto} W. Total ${totalWatts} W.`,
    },
  };
}
