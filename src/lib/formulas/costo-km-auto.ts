/** Costo por kilómetro del auto */
export interface Inputs { kmMensuales: number; consumoKm: number; precioNafta: number; seguroMensual?: number; patenteMensual?: number; mantenimientoMes?: number; estacionamientoMes?: number; }
export interface Outputs { costoPorKm: number; costoMensualTotal: number; costoNaftaMes: number; costosFijosMes: number; _chart?: any; _insight?: any; }

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

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Nafta', value: Math.round(costoNaftaMes) },
      { label: 'Seguro', value: Math.round(seguro) },
      { label: 'Patente', value: Math.round(patente) },
      { label: 'Mantenimiento', value: Math.round(mant) },
      { label: 'Estacionamiento', value: Math.round(estac) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(costoMensualTotal).toLocaleString('es-AR'),
    centerLabel: 'Total/mes',
    ariaLabel: 'Composición del costo mensual del auto: nafta, seguro, patente, mantenimiento y estacionamiento.',
  };

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const pctNafta = costoMensualTotal > 0 ? Math.round((costoNaftaMes / costoMensualTotal) * 100) : 0;
  const insight = {
    title: 'Cuánto te cuesta cada km',
    text: costosFijosMes > 0
      ? `Cada kilómetro te sale **$${fmt.format(Math.round(costoPorKm))}**. La nafta es solo el **${pctNafta}%**: el resto son costos fijos (seguro, patente, mantenimiento) que pagás manejes mucho o poco.`
      : `Cada kilómetro te sale **$${fmt.format(Math.round(costoPorKm))}**, todo en combustible. Sumando seguro, patente y mantenimiento, el costo real por km es bastante más alto.`,
    tone: 'neutral' as const,
    icon: '🚗',
  };

  return {
    costoPorKm: Math.round(costoPorKm),
    costoMensualTotal: Math.round(costoMensualTotal),
    costoNaftaMes: Math.round(costoNaftaMes),
    costosFijosMes: Math.round(costosFijosMes),
    _chart: chart,
    _insight: insight,
  };
}
