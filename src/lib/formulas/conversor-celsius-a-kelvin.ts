/** Conversor: grado Celsius ↔ Kelvin */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; _chart?: any; }

export function conversorCelsiusAKelvin(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const slope = 1.0;
  const offset = 273.15;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * slope + offset;
    fromLabel = '°C'; toLabel = 'K';
  } else {
    r = (v - offset) / slope;
    fromLabel = 'K'; toLabel = '°C';
  }

  // Valor en cada escala para interpretar el resultado (independiente de la dirección).
  const celsius = d === 'ida' ? v : r;
  const kelvin = d === 'ida' ? r : v;

  let estado: string, tone: 'good' | 'warn' | 'neutral', icon: string;
  if (kelvin < 0) {
    estado = 'por debajo del cero absoluto (físicamente imposible)';
    tone = 'warn'; icon = '🚫';
  } else if (celsius <= 0) {
    estado = 'agua congelada (hielo)';
    tone = 'neutral'; icon = '🧊';
  } else if (celsius >= 100) {
    estado = 'agua en ebullición o vapor';
    tone = 'warn'; icon = '♨️';
  } else if (celsius >= 36 && celsius <= 38) {
    estado = 'temperatura corporal humana';
    tone = 'good'; icon = '🌡️';
  } else {
    estado = 'agua en estado líquido';
    tone = 'neutral'; icon = '🌡️';
  }

  const insight = {
    title: 'Qué significa este valor',
    text: '**' + celsius.toFixed(1).replace(/\.0$/, '') + ' °C** equivalen a **' + kelvin.toFixed(2) + ' K**: en la escala absoluta el cero (0 K) es **−273,15 °C**, y este punto cae en la zona de ' + estado + '.',
    tone,
    icon
  };

  const out: Outputs = {
    resultado: r.toFixed(4) + ' ' + toLabel,
    resumen: v.toString() + ' ' + fromLabel + ' = ' + r.toFixed(2) + ' ' + toLabel + '.',
    _insight: insight
  };

  // Gauge sobre la escala Kelvin con hitos físicos de referencia.
  if (kelvin >= 0) {
    out._chart = {
      type: 'scale',
      marker: Number(kelvin.toFixed(2)),
      markerLabel: kelvin.toFixed(2) + ' K',
      min: 0,
      segments: [
        { nombre: 'Frío extremo', max: 273.15, color: '#60a5fa', colorDark: '#3b82f6' },
        { nombre: 'Agua líquida', max: 373.15, color: '#34d399', colorDark: '#10b981' },
        { nombre: 'Vapor / calor', max: Math.max(573.15, kelvin + 50), color: '#f87171', colorDark: '#ef4444' }
      ],
      ariaLabel: 'Posición de ' + kelvin.toFixed(2) + ' K en la escala absoluta de temperatura'
    };
  }

  return out;
}
