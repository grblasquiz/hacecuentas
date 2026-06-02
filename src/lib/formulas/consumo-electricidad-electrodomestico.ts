/** Consumo eléctrico de un electrodoméstico */
export interface Inputs { potenciaWatts: number; horasDia: number; diasMes?: number; precioKwh: number; }
export interface Outputs { consumoMensualKwh: string; costoMensual: number; costoAnual: number; consumoDiarioKwh: string; _insight?: any; }

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

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const nivel = kwhMes >= 150 ? 'alto' : kwhMes >= 50 ? 'moderado' : 'bajo';
  const insightText = nivel === 'alto'
    ? `Consumo **alto**: este aparato suma **${kwhMes.toFixed(0)} kWh/mes** ($${fmt.format(Math.round(costoMensual))}). En el año pesa **$${fmt.format(Math.round(costoAnual))}** en la factura — vale la pena reducir horas o cambiarlo por uno eficiente.`
    : nivel === 'moderado'
    ? `Consumo **moderado**: **${kwhMes.toFixed(0)} kWh/mes** ($${fmt.format(Math.round(costoMensual))}/mes, **$${fmt.format(Math.round(costoAnual))}/año**). Bajar el uso diario impacta directo en el costo anual.`
    : `Consumo **bajo**: apenas **${kwhMes.toFixed(1)} kWh/mes** ($${fmt.format(Math.round(costoMensual))}/mes). En 12 meses son **$${fmt.format(Math.round(costoAnual))}**.`;

  return {
    consumoMensualKwh: `${kwhMes.toFixed(1)} kWh/mes`,
    costoMensual: Math.round(costoMensual),
    costoAnual: Math.round(costoAnual),
    consumoDiarioKwh: `${kwhDia.toFixed(2)} kWh/día`,
    _insight: {
      title: 'Qué significa este consumo',
      text: insightText,
      tone: nivel === 'alto' ? 'warn' : nivel === 'bajo' ? 'good' : 'neutral',
      icon: '⚡',
    },
  };
}
