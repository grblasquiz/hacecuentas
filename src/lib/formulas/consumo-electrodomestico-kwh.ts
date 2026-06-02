/** Consumo electrodoméstico: kWh mensual */
export interface Inputs { watts: number; horasDia: number; diasMes: number; costoKwh?: number; }
export interface Outputs { kwhMes: number; costoMes: number; kwhAnual: number; costoAnual: number; _insight?: any; }

export function consumoElectrodomesticoKwh(i: Inputs): Outputs {
  const w = Number(i.watts); const h = Number(i.horasDia); const d = Number(i.diasMes);
  // Default abril 2026: EDENOR sin subsidio $115/kWh (tarifa simple, sin impuestos)
  // El usuario puede ingresar su propio valor desde la factura.
  const costo = Number(i.costoKwh) || 115;
  if (!w || w <= 0) throw new Error('Ingresá la potencia en watts');
  if (!h || h <= 0) throw new Error('Ingresá las horas de uso');
  const kwhMes = (w * h * d) / 1000;
  const kwhAnual = kwhMes * 12;
  const costoMes = Math.round(kwhMes * costo);
  const costoAnual = Math.round(kwhAnual * costo);
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const nivel = kwhMes >= 150 ? 'alto' : kwhMes >= 50 ? 'moderado' : 'bajo';
  const insightText = nivel === 'alto'
    ? `Consumo **alto**: **${kwhMes.toFixed(0)} kWh/mes** ($${fmt.format(costoMes)}/mes). En el año son **$${fmt.format(costoAnual)}** — conviene reducir horas o cambiarlo por uno eficiente.`
    : nivel === 'moderado'
    ? `Consumo **moderado**: **${kwhMes.toFixed(0)} kWh/mes** ($${fmt.format(costoMes)}/mes, **$${fmt.format(costoAnual)}/año**). Menos horas de uso bajan el costo directo.`
    : `Consumo **bajo**: **${kwhMes.toFixed(1)} kWh/mes** ($${fmt.format(costoMes)}/mes). En 12 meses, **$${fmt.format(costoAnual)}**.`;
  return { kwhMes: Number(kwhMes.toFixed(1)), costoMes, kwhAnual: Number(kwhAnual.toFixed(0)), costoAnual,
    _insight: {
      title: 'Qué significa este consumo',
      text: insightText,
      tone: nivel === 'alto' ? 'warn' : nivel === 'bajo' ? 'good' : 'neutral',
      icon: '⚡',
    } };
}
