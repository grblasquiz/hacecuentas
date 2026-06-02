/** Costo del aire acondicionado por hora */
export interface Inputs { frigorias: string; wattsCustom?: number; esInverter?: string; horasDia: number; precioKwh: number; }
export interface Outputs { costoHora: number; costoDia: number; costoMes: number; consumoKwhMes: string; _insight?: any; }

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

  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  // Ahorro de un inverter vs un equipo on/off equivalente (consume 0.62x): la diferencia es el 38% extra del on/off.
  const ahorroInverterMes = inverter ? Math.round(costoMes / 0.62 - costoMes) : 0;
  const _insight = {
    title: 'Lo que te cuesta el aire al mes',
    text:
      `Usándolo **${hsDia} h por día**, el equipo suma **$${fmt(costoMes)}/mes** (~$${fmt(costoHora)} por hora). ` +
      (inverter
        ? `Por ser **inverter** te ahorrás unos **$${fmt(ahorroInverterMes)}/mes** frente a un on/off equivalente.`
        : `Un equipo **inverter** consumiría ~38% menos: pasarte ahorraría cerca de **$${fmt(costoMes - costoMes * 0.62)}/mes**.`),
    tone: inverter ? 'good' : 'neutral',
    icon: '❄️',
  };

  return {
    costoHora: Math.round(costoHora),
    costoDia: Math.round(costoDia),
    costoMes: Math.round(costoMes),
    consumoKwhMes: `${kwhMes.toFixed(1)} kWh/mes`,
    _insight,
  };
}
