/** Conversor: grado Fahrenheit ↔ grado Celsius */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorFahrenheitACelsius(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const slope = 0.5556;
  const offset = -17.778;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * slope + offset;
    fromLabel = '°F'; toLabel = '°C';
  } else {
    r = (v - offset) / slope;
    fromLabel = '°C'; toLabel = '°F';
  }
  // Celsius de referencia para interpretar el clima/temperatura (ida da °C; en vuelta lo reconstruimos desde el input)
  const celsius = d === 'ida' ? r : v;
  let zona: string, tone: 'good' | 'warn' | 'neutral', icon: string;
  if (celsius <= 0) { zona = 'bajo cero: el agua se congela y hace frío extremo'; tone = 'warn'; icon = '🥶'; }
  else if (celsius < 18) { zona = 'fresco a frío'; tone = 'neutral'; icon = '🧥'; }
  else if (celsius <= 26) { zona = 'una temperatura agradable, de confort'; tone = 'good'; icon = '🌡️'; }
  else if (celsius < 38) { zona = 'caluroso'; tone = 'warn'; icon = '☀️'; }
  else { zona = 'calor extremo (cerca o por encima de la fiebre humana)'; tone = 'warn'; icon = '🔥'; }
  const insight = {
    title: 'Qué significa este resultado',
    text: '**' + celsius.toFixed(1) + ' °C** corresponde a ' + zona + '. Recordá: 0 °C = 32 °F (congela el agua) y 100 °C = 212 °F (hierve).',
    tone,
    icon
  };
  return {
    resultado: r.toFixed(4) + ' ' + toLabel,
    resumen: v.toString() + ' ' + fromLabel + ' = ' + r.toFixed(2) + ' ' + toLabel + '.',
    _insight: insight
  };
}
