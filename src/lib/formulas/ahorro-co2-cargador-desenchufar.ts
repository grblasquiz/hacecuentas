export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ahorroCo2CargadorDesenchufar(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const n = Number(i.numCargadores) || 0; const w = Number(i.wPromedio) || 0.5;
  const kWh = (n * w * 24 * 365) / 1000;
  // EN: US avg $0.16/kWh (EIA 2023); ES: Argentina tarifa residencial ~$80 ARS/kWh
  const cost = __lang === 'en' ? kWh * 0.16 : kWh * 80;
  // EN: EPA eGRID 2023 US national 0.386 kg CO2/kWh; ES: CAMMESA Argentina 0.37 kg/kWh
  const co2 = kWh * (__lang === 'en' ? 0.386 : 0.37);
  const costStr = __lang === 'en' ? '$' + cost.toFixed(2) : '$' + cost.toFixed(0);
  const resumen = __lang === 'en'
    ? `Unplugging saves ${kWh.toFixed(1)} kWh/year (${costStr}) and avoids ${co2.toFixed(1)} kg CO₂.`
    : `Ahorrás ${kWh.toFixed(1)} kWh/año (${costStr}) y evitás ${co2.toFixed(1)} kg de CO₂.`;
  const _insight = __lang === 'en'
    ? { title: 'Phantom load', text: `Leaving **${n} charger(s)** plugged in wastes **${kWh.toFixed(1)} kWh/year** (${costStr}) and emits around **${co2.toFixed(1)} kg of CO₂** — at the U.S. average grid intensity of 386 g CO₂/kWh (EPA eGRID 2023). Unplugging costs nothing.`, tone: 'neutral', icon: '🔌' }
    : { title: 'Consumo fantasma', text: `Dejar **${n} cargador(es)** enchufado(s) tira **${kWh.toFixed(1)} kWh/año** (${costStr}) y emite unos **${co2.toFixed(1)} kg de CO₂**. Desenchufar no cuesta nada.`, tone: 'neutral', icon: '🔌' };
  return { kwhAño: kWh.toFixed(2), pesosAño: costStr, resumen, _insight };
}
