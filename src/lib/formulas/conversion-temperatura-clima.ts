/** Conversión Celsius ↔ Fahrenheit ↔ Kelvin + sensación térmica para viajes */
export interface Inputs {
  valor: number;
  unidadOrigen: string; // 'celsius' | 'fahrenheit' | 'kelvin'
  vientoKmh: number;
  humedad: number; // %
}

export interface Outputs {
  celsius: number;
  fahrenheit: number;
  kelvin: number;
  sensacionTermica: number;
  indiceCalor: number;
  recomendacion: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function conversionTemperaturaClima(i: Inputs): Outputs {
  const v = Number(i.valor);
  const unidad = String(i.unidadOrigen || 'celsius');
  const viento = Number(i.vientoKmh) || 0;
  const hum = Number(i.humedad) || 50;

  if (isNaN(v)) throw new Error('Ingresá un valor de temperatura');

  let c = v;
  if (unidad === 'fahrenheit') c = (v - 32) * (5 / 9);
  else if (unidad === 'kelvin') c = v - 273.15;

  if (c < -273.15) throw new Error('Temperatura por debajo del cero absoluto');

  const f = c * (9 / 5) + 32;
  const k = c + 273.15;

  // Sensación térmica por viento (wind chill) - cuando hace frío
  let sensacion = c;
  if (c <= 10 && viento > 4.8) {
    // Fórmula oficial Environment Canada
    sensacion =
      13.12 +
      0.6215 * c -
      11.37 * Math.pow(viento, 0.16) +
      0.3965 * c * Math.pow(viento, 0.16);
  }

  // Índice de calor (heat index) - cuando hace calor con humedad
  let indiceCalor = c;
  if (c >= 27) {
    const fReal = c * 9 / 5 + 32;
    const hi =
      -42.379 +
      2.04901523 * fReal +
      10.14333127 * hum -
      0.22475541 * fReal * hum -
      0.00683783 * fReal * fReal -
      0.05481717 * hum * hum +
      0.00122874 * fReal * fReal * hum +
      0.00085282 * fReal * hum * hum -
      0.00000199 * fReal * fReal * hum * hum;
    indiceCalor = (hi - 32) * 5 / 9;
  }

  let recomendacion = 'Clima templado — ropa ligera en capas.';
  if (c < -10) recomendacion = 'Frío extremo — abrigo térmico, gorro, guantes, cubrir piel expuesta.';
  else if (c < 0) recomendacion = 'Muy frío — campera de pluma, bufanda, guantes.';
  else if (c < 10) recomendacion = 'Frío — campera + polar, pantalón largo.';
  else if (c < 20) recomendacion = 'Fresco — pulóver liviano o campera fina.';
  else if (c < 28) recomendacion = 'Agradable — ropa liviana.';
  else if (c < 35) recomendacion = 'Calor — algodón, hidratación, protector solar.';
  else recomendacion = 'Calor extremo — evitá exposición al sol 11-16h, mucha agua.';

  // Insight dinámico según banda térmica y sensación percibida
  const sensDiff = sensacion - c; // negativo = el viento la baja
  const calorDiff = indiceCalor - c; // positivo = la humedad la sube
  let insight: { title: string; text: string; tone: string; icon: string };
  if (c < 0) {
    insight = {
      title: 'Frío bajo cero',
      text: `**${c.toFixed(1)}°C** (${f.toFixed(1)}°F). ` +
        (sensDiff < -1
          ? `El viento la hace sentir como **${sensacion.toFixed(1)}°C**: priorizá cortavientos y cubrir piel expuesta.`
          : `Abrigo térmico y capas para protegerte del frío.`),
      tone: 'warn',
      icon: '🥶',
    };
  } else if (c >= 32) {
    insight = {
      title: 'Calor intenso',
      text: `**${c.toFixed(1)}°C** (${f.toFixed(1)}°F). ` +
        (calorDiff > 1
          ? `Con la humedad la sensación trepa a **${indiceCalor.toFixed(1)}°C**: hidratate y evitá el sol del mediodía.`
          : `Hidratación, protector solar y sombra en las horas pico.`),
      tone: 'warn',
      icon: '🥵',
    };
  } else if (c >= 18 && c < 28) {
    insight = {
      title: 'Temperatura agradable',
      text: `**${c.toFixed(1)}°C** (${f.toFixed(1)}°F) es zona de confort: ropa liviana alcanza para todo el día.`,
      tone: 'good',
      icon: '🌤️',
    };
  } else {
    insight = {
      title: 'Clima templado',
      text: `**${c.toFixed(1)}°C** equivale a **${f.toFixed(1)}°F** y **${k.toFixed(2)}K**. ` +
        (sensDiff < -1 ? `Con viento se siente como ${sensacion.toFixed(1)}°C. ` : ``) + recomendacion,
      tone: 'neutral',
      icon: '🌡️',
    };
  }

  const chartMin = Math.min(-15, Math.floor(c) - 5);
  const chartTop = Math.max(45.01, c + 5);
  const chart = {
    type: 'scale',
    marker: Number(c.toFixed(1)),
    markerLabel: `${c.toFixed(1)}°C`,
    min: chartMin,
    segments: [
      { nombre: 'Frío extremo', max: -10, color: '#1d4ed8', colorDark: '#1e3a8a' },
      { nombre: 'Muy frío', max: 0, color: '#3b82f6', colorDark: '#1d4ed8' },
      { nombre: 'Frío', max: 10, color: '#38bdf8', colorDark: '#0284c7' },
      { nombre: 'Fresco', max: 18, color: '#22c55e', colorDark: '#15803d' },
      { nombre: 'Agradable', max: 28, color: '#84cc16', colorDark: '#4d7c0f' },
      { nombre: 'Calor', max: 35, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Calor extremo', max: Number(chartTop.toFixed(1)), color: '#ef4444', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Temperatura de ${c.toFixed(1)} grados Celsius en la escala de confort térmico`,
  };

  return {
    celsius: Number(c.toFixed(2)),
    fahrenheit: Number(f.toFixed(2)),
    kelvin: Number(k.toFixed(2)),
    sensacionTermica: Number(sensacion.toFixed(1)),
    indiceCalor: Number(indiceCalor.toFixed(1)),
    recomendacion,
    resumen: `**${c.toFixed(1)}°C** = ${f.toFixed(1)}°F = ${k.toFixed(2)}K. Sensación térmica ${sensacion.toFixed(1)}°C. ${recomendacion}`,
    _insight: insight,
    _chart: chart,
  };
}
