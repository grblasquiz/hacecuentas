/** Conversor: grado Fahrenheit ↔ grado Celsius */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; _chart?: any; }

export function conversorFahrenheitACelsiusHorno(i: Inputs): Outputs {
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

  // Valor en cada escala (independiente de la dirección) para interpretar el horno.
  const celsius = d === 'ida' ? r : v;
  const fahrenheit = d === 'ida' ? v : r;

  let zona: string, tone: 'good' | 'warn' | 'neutral', icon: string;
  if (celsius < 120) {
    zona = 'horno suave: secar merengues, deshidratar o mantener caliente';
    tone = 'neutral'; icon = '🌡️';
  } else if (celsius < 180) {
    zona = 'horno moderado: bizcochuelos, budines y tartas';
    tone = 'good'; icon = '🍰';
  } else if (celsius < 220) {
    zona = 'horno fuerte: panes, pizzas y la mayoría de los asados';
    tone = 'good'; icon = '🍕';
  } else {
    zona = 'horno muy fuerte: gratinar, dorar rápido o pizza a la piedra';
    tone = 'warn'; icon = '🔥';
  }

  const insight = {
    title: 'A qué horno equivale',
    text: '**' + fahrenheit.toFixed(0) + ' °F** son **' + celsius.toFixed(0) + ' °C**: cae en zona de ' + zona + '.',
    tone,
    icon
  };

  const out: Outputs = {
    resultado: r.toFixed(4) + ' ' + toLabel,
    resumen: v.toString() + ' ' + fromLabel + ' = ' + r.toFixed(2) + ' ' + toLabel + '.',
    _insight: insight
  };

  // Gauge con las zonas típicas de horno en °C.
  out._chart = {
    type: 'scale',
    marker: Number(celsius.toFixed(0)),
    markerLabel: celsius.toFixed(0) + ' °C',
    min: Math.min(50, celsius - 10),
    segments: [
      { nombre: 'Suave', max: 120, color: '#60a5fa', colorDark: '#3b82f6' },
      { nombre: 'Moderado', max: 180, color: '#34d399', colorDark: '#10b981' },
      { nombre: 'Fuerte', max: 220, color: '#fbbf24', colorDark: '#f59e0b' },
      { nombre: 'Muy fuerte', max: Math.max(280, celsius + 10), color: '#f87171', colorDark: '#ef4444' }
    ],
    ariaLabel: 'Posición de ' + celsius.toFixed(0) + ' grados Celsius en las zonas de temperatura de horno'
  };

  return out;
}
