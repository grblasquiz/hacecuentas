export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function energiaElectrodomesticoEtiquetaEficiencia(i: Inputs): Outputs {
  const a = Number(i.kwhClaseActual) || 0; const n = Number(i.kwhClaseNueva) || 0;
  const t = Number(i.tarifa) || 80;
  const kWh = a - n; const pesos = kWh * t;
  return { ahorroKwhAño: kWh.toFixed(0), ahorroPesosAño: '$' + pesos.toFixed(0), resumen: `Ahorrás ${kWh.toFixed(0)} kWh/año = $${pesos.toFixed(0)} AR.` };
}
