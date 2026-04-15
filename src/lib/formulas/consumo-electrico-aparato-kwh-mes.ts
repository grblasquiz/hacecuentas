/** Consumo eléctrico mensual de un aparato en kWh y costo */
export interface Inputs { potenciaWatts: number; horasUsoDiario: number; diasPorMes: number; tarifaKwh: number; }
export interface Outputs { kwhMes: number; costoMes: number; kwhAnio: number; costoAnio: number; detalle: string; }

export function consumoElectricoAparatoKwhMes(i: Inputs): Outputs {
  const watts = Number(i.potenciaWatts);
  const horas = Number(i.horasUsoDiario);
  const dias = Number(i.diasPorMes);
  const tarifa = Number(i.tarifaKwh);

  if (!watts || watts <= 0) throw new Error('Ingresá la potencia en watts');
  if (!horas || horas <= 0) throw new Error('Ingresá las horas de uso diario');
  if (!dias || dias <= 0) throw new Error('Ingresá los días por mes');
  if (!tarifa || tarifa <= 0) throw new Error('Ingresá la tarifa eléctrica');

  const kwhDia = (watts * horas) / 1000;
  const kwhMes = kwhDia * dias;
  const costoMes = kwhMes * tarifa;
  const kwhAnio = kwhMes * 12;
  const costoAnio = costoMes * 12;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
  const fmtP = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    kwhMes: Number(kwhMes.toFixed(1)),
    costoMes: Number(costoMes.toFixed(0)),
    kwhAnio: Number(kwhAnio.toFixed(0)),
    costoAnio: Number(costoAnio.toFixed(0)),
    detalle: `${fmtP.format(watts)} W × ${fmt.format(horas)} h/día ÷ 1.000 = ${fmt.format(kwhDia)} kWh/día × ${dias} días = ${fmt.format(kwhMes)} kWh/mes × $${fmtP.format(tarifa)} = $${fmtP.format(costoMes)}/mes ($${fmtP.format(costoAnio)}/año).`,
  };
}
