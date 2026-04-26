/** Watts LED necesarios para acuario plantado según litros y nivel */
export interface Inputs { litros: number; nivelPlantas: string; profundidadCm: number; horasFotoperiodo: number; }
export interface Outputs { wattsRecomendados: number; lumenesObjetivo: number; consumoKwhMes: number; costoElectricidadMes: number; explicacion: string; }
export function acuarioIluminacionWattsLitrosPlantado(i: Inputs): Outputs {
  const litros = Number(i.litros);
  const nivel = String(i.nivelPlantas || '').toLowerCase();
  const profundidad = Number(i.profundidadCm) || 40;
  const horas = Number(i.horasFotoperiodo) || 8;
  if (!litros || litros <= 0) throw new Error('Ingresá los litros del acuario');
  // W/L LED objetivo según nivel
  const wattsPorLitro: Record<string, number> = {
    'bajo': 0.4, 'medio': 0.6, 'alto': 0.9, 'iwagumi-co2': 1.1,
  };
  const wpl = wattsPorLitro[nivel] ?? 0.6;
  const factorProfundidad = profundidad > 50 ? 1.3 : profundidad > 40 ? 1.1 : 1;
  const watts = litros * wpl * factorProfundidad;
  const lumenes = watts * 90; // ~90 lm/W LED moderno
  const kwhMes = (watts / 1000) * horas * 30;
  const costo = kwhMes * 95; // ARS/kWh ref 2026 Argentina
  return {
    wattsRecomendados: Number(watts.toFixed(0)),
    lumenesObjetivo: Number(lumenes.toFixed(0)),
    consumoKwhMes: Number(kwhMes.toFixed(2)),
    costoElectricidadMes: Number(costo.toFixed(0)),
    explicacion: `Acuario ${litros}L plantado nivel ${nivel}: ~${watts.toFixed(0)}W LED (${lumenes.toFixed(0)} lúmenes). ${horas}h/día = ${kwhMes.toFixed(1)} kWh/mes.`,
  };
}
