export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function conversionFahrenheitCelsiusClima(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const r = u === 'a' ? (v - 32) * 5 / 9 : v * 9 / 5 + 32;
  const fromU = u === 'a' ? '°F' : '°C';
  const toU = u === 'a' ? '°C' : '°F';

  // Temperatura en °C para clasificar el clima (sea cual sea el sentido de la conversión)
  const celsius = u === 'a' ? r : v;
  let cat: string, tone: 'good' | 'warn' | 'neutral', icon: string;
  if (celsius <= 0) { cat = 'helada (bajo cero)'; tone = 'warn'; icon = '🥶'; }
  else if (celsius < 10) { cat = 'frío'; tone = 'neutral'; icon = '🧥'; }
  else if (celsius < 18) { cat = 'fresco'; tone = 'neutral'; icon = '🌥️'; }
  else if (celsius < 27) { cat = 'templado / agradable'; tone = 'good'; icon = '😎'; }
  else if (celsius < 35) { cat = 'caluroso'; tone = 'warn'; icon = '🥵'; }
  else { cat = 'calor extremo'; tone = 'warn'; icon = '🔥'; }

  return {
    resultado: r.toFixed(2) + ' ' + toU,
    resumen: `${v} ${fromU} = ${r.toFixed(2)} ${toU}.`,
    _insight: {
      title: 'Qué clima es esto',
      text: `**${v} ${fromU}** equivalen a **${r.toFixed(1)} ${toU}** (${celsius.toFixed(1)} °C): se siente como un día de clima **${cat}**.`,
      tone,
      icon
    },
    _chart: {
      type: 'scale',
      marker: Number(celsius.toFixed(1)),
      markerLabel: `${celsius.toFixed(1)} °C`,
      min: -10,
      segments: [
        { nombre: 'Helada', max: 0, color: '#2563eb', colorDark: '#3b82f6' },
        { nombre: 'Frío', max: 10, color: '#0ea5e9', colorDark: '#38bdf8' },
        { nombre: 'Fresco', max: 18, color: '#14b8a6', colorDark: '#2dd4bf' },
        { nombre: 'Templado', max: 27, color: '#22c55e', colorDark: '#4ade80' },
        { nombre: 'Caluroso', max: 35, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Extremo', max: Math.max(45, Math.ceil(celsius) + 5), color: '#ef4444', colorDark: '#f87171' }
      ],
      ariaLabel: `Escala de clima: ${celsius.toFixed(1)} grados Celsius cae en zona ${cat}`
    }
  };
}
