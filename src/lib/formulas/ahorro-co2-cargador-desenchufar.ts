export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ahorroCo2CargadorDesenchufar(i: Inputs): Outputs {
  const n = Number(i.numCargadores) || 0; const w = Number(i.wPromedio) || 0.5;
  const kWh = (n * w * 24 * 365) / 1000;
  const pesos = kWh * 80;
  return { kwhAño: kWh.toFixed(2), pesosAño: '$' + pesos.toFixed(0), resumen: `Ahorrás ${kWh.toFixed(1)} kWh/año ($${pesos.toFixed(0)}) desconectando cargadores.` };
}
