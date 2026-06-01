export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ahorroCo2CargadorDesenchufar(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const n = Number(i.numCargadores) || 0; const w = Number(i.wPromedio) || 0.5;
  const kWh = (n * w * 24 * 365) / 1000;
  const pesos = kWh * 80;
  const co2 = kWh * 0.4; // ~0,4 kg CO2 por kWh (mix eléctrico promedio)
  const resumen = __lang === 'en'
    ? `You save ${kWh.toFixed(1)} kWh/year ($${pesos.toFixed(0)}) by unplugging chargers.`
    : `Ahorrás ${kWh.toFixed(1)} kWh/año ($${pesos.toFixed(0)}) desconectando cargadores.`;
  const _insight = __lang === 'en'
    ? { title: 'Phantom load', text: `Leaving **${n} charger(s)** plugged in wastes **${kWh.toFixed(1)} kWh/year** ($${pesos.toFixed(0)}) and around **${co2.toFixed(1)} kg of CO₂**. It is little money, but unplugging costs nothing.`, tone: 'neutral', icon: '🔌' }
    : { title: 'Consumo fantasma', text: `Dejar **${n} cargador(es)** enchufado(s) tira **${kWh.toFixed(1)} kWh/año** ($${pesos.toFixed(0)}) y unos **${co2.toFixed(1)} kg de CO₂**. Es poca plata, pero desenchufar no cuesta nada.`, tone: 'neutral', icon: '🔌' };
  return { kwhAño: kWh.toFixed(2), pesosAño: '$' + pesos.toFixed(0), resumen, _insight };
}
