/** Conversor: grado Fahrenheit ↔ Kelvin */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorFahrenheitAKelvin(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const slope = 0.5556;
  const offset = 255.372;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * slope + offset;
    fromLabel = '°F'; toLabel = 'K';
  } else {
    r = (v - offset) / slope;
    fromLabel = 'K'; toLabel = '°F';
  }
  // Kelvin de referencia (ida da K; en vuelta el input ya está en K)
  const kelvin = d === 'ida' ? r : v;
  const celsius = kelvin - 273.15;
  let zona: string, tone: 'good' | 'warn' | 'neutral', icon: string;
  if (kelvin < 0) { zona = 'imposible físicamente: ningún sistema puede estar por debajo del cero absoluto (0 K)'; tone = 'warn'; icon = '🚫'; }
  else if (kelvin < 273.15) { zona = 'bajo el punto de congelación del agua (273,15 K)'; tone = 'neutral'; icon = '❄️'; }
  else if (kelvin <= 373.15) { zona = 'entre el congelamiento y la ebullición del agua'; tone = 'good'; icon = '🌡️'; }
  else { zona = 'por encima del punto de ebullición del agua (373,15 K)'; tone = 'warn'; icon = '🔥'; }
  const insight = {
    title: 'Qué significa este resultado',
    text: '**' + kelvin.toFixed(2) + ' K** equivalen a **' + celsius.toFixed(1) + ' °C**, ' + zona + '. La escala Kelvin arranca en el cero absoluto (0 K = −273,15 °C).',
    tone,
    icon
  };
  return {
    resultado: r.toFixed(4) + ' ' + toLabel,
    resumen: v.toString() + ' ' + fromLabel + ' = ' + r.toFixed(2) + ' ' + toLabel + '.',
    _insight: insight
  };
}
