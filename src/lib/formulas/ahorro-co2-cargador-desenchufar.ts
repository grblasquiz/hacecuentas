export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function ahorroCo2CargadorDesenchufar(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const n = Number(i.numCargadores) || 0; const w = Number(i.wPromedio) || 0.5;
  const kWh = (n * w * 24 * 365) / 1000;
  const pesos = kWh * 80;
  const resumen = __lang === 'en'
    ? `You save ${kWh.toFixed(1)} kWh/year ($${pesos.toFixed(0)}) by unplugging chargers.`
    : `Ahorrás ${kWh.toFixed(1)} kWh/año ($${pesos.toFixed(0)}) desconectando cargadores.`;
  return { kwhAño: kWh.toFixed(2), pesosAño: '$' + pesos.toFixed(0), resumen };
}
