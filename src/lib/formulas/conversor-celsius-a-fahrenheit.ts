/** Conversor: grado Celsius ↔ grado Fahrenheit */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; _chart?: any; }

export function conversorCelsiusAFahrenheit(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const slope = 1.8;
  const offset = 32;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * slope + offset;
    fromLabel = '°C'; toLabel = '°F';
  } else {
    r = (v - offset) / slope;
    fromLabel = '°F'; toLabel = '°C';
  }
  const tempC = d === 'ida' ? v : r;
  const tempF = d === 'ida' ? r : v;

  let zona: string;
  let tone: 'good' | 'warn' | 'neutral';
  if (tempC <= 0) { zona = 'bajo cero (riesgo de congelamiento)'; tone = 'warn'; }
  else if (tempC < 10) { zona = 'frío'; tone = 'neutral'; }
  else if (tempC < 18) { zona = 'fresco'; tone = 'neutral'; }
  else if (tempC <= 26) { zona = 'temperatura agradable'; tone = 'good'; }
  else if (tempC < 35) { zona = 'calor'; tone = 'neutral'; }
  else { zona = 'calor extremo (golpe de calor)'; tone = 'warn'; }

  const _insight = {
    title: 'Qué se siente a esa temperatura',
    text: `**${tempC.toFixed(1).replace(/\.0$/, '')} °C** equivalen a **${tempF.toFixed(1).replace(/\.0$/, '')} °F**: es ${zona}. Como referencia, el agua se congela a 0 °C (32 °F), el cuerpo ronda los 37 °C (98,6 °F) y el agua hierve a 100 °C (212 °F).`,
    tone,
    icon: '🌡️',
  };

  // Gauge sobre el eje Celsius: zonas térmicas de frío a calor.
  const markerC = Math.max(-20, Math.min(50, tempC));
  const _chart = {
    type: 'scale',
    marker: markerC,
    markerLabel: tempC.toFixed(1).replace(/\.0$/, '') + ' °C',
    min: -20,
    segments: [
      { nombre: 'Bajo cero', max: 0, color: '#60a5fa', colorDark: '#3b82f6' },
      { nombre: 'Frío', max: 10, color: '#7dd3fc', colorDark: '#38bdf8' },
      { nombre: 'Fresco', max: 18, color: '#86efac', colorDark: '#4ade80' },
      { nombre: 'Agradable', max: 26, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Calor', max: 35, color: '#fbbf24', colorDark: '#f59e0b' },
      { nombre: 'Extremo', max: 50, color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: `Termómetro: ${tempC.toFixed(1).replace(/\.0$/, '')} grados Celsius en la zona de ${zona}`,
  };

  return {
    resultado: r.toFixed(4) + ' ' + toLabel,
    resumen: v.toString() + ' ' + fromLabel + ' = ' + r.toFixed(2) + ' ' + toLabel + '.',
    _insight,
    _chart
  };
}
