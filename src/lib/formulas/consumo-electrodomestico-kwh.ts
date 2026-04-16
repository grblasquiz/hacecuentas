/** Consumo electrodoméstico: kWh mensual */
export interface Inputs { watts: number; horasDia: number; diasMes: number; costoKwh?: number; }
export interface Outputs { kwhMes: number; costoMes: number; kwhAnual: number; costoAnual: number; }

export function consumoElectrodomesticoKwh(i: Inputs): Outputs {
  const w = Number(i.watts); const h = Number(i.horasDia); const d = Number(i.diasMes);
  const costo = Number(i.costoKwh) || 150;
  if (!w || w <= 0) throw new Error('Ingresá la potencia en watts');
  if (!h || h <= 0) throw new Error('Ingresá las horas de uso');
  const kwhMes = (w * h * d) / 1000;
  const kwhAnual = kwhMes * 12;
  return { kwhMes: Number(kwhMes.toFixed(1)), costoMes: Math.round(kwhMes * costo), kwhAnual: Number(kwhAnual.toFixed(0)), costoAnual: Math.round(kwhAnual * costo) };
}
