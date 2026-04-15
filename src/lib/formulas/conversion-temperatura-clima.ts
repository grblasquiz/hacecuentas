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

  return {
    celsius: Number(c.toFixed(2)),
    fahrenheit: Number(f.toFixed(2)),
    kelvin: Number(k.toFixed(2)),
    sensacionTermica: Number(sensacion.toFixed(1)),
    indiceCalor: Number(indiceCalor.toFixed(1)),
    recomendacion,
    resumen: `**${c.toFixed(1)}°C** = ${f.toFixed(1)}°F = ${k.toFixed(2)}K. Sensación térmica ${sensacion.toFixed(1)}°C. ${recomendacion}`,
  };
}
