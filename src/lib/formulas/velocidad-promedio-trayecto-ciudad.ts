/** Calculadora de velocidad promedio en trayecto urbano */
export interface Inputs {
  distanciaKm: number;
  tiempoMinutos: number;
}
export interface Outputs {
  velocidadPromedio: number;
  tiempoPorKm: string;
  detalle: string;
}

export function velocidadPromedioTrayectoCiudad(i: Inputs): Outputs {
  const km = Number(i.distanciaKm);
  const min = Number(i.tiempoMinutos);

  if (!km || km <= 0) throw new Error('Ingresá la distancia en kilómetros');
  if (!min || min <= 0) throw new Error('Ingresá el tiempo en minutos');

  const horas = min / 60;
  const velocidad = km / horas;
  const minPorKm = min / km;

  // Comparación con promedios
  let comparacion = '';
  if (velocidad < 10) {
    comparacion = 'Más lento que caminar rápido. Mucho tráfico o transporte lento.';
  } else if (velocidad < 18) {
    comparacion = 'Velocidad típica de hora pico en CABA. Similar a ir en bici.';
  } else if (velocidad < 30) {
    comparacion = 'Velocidad razonable para tráfico urbano moderado.';
  } else if (velocidad < 50) {
    comparacion = 'Buen ritmo, probablemente fuera de hora pico o por autopista.';
  } else {
    comparacion = 'Velocidad de ruta o autopista libre.';
  }

  return {
    velocidadPromedio: Number(velocidad.toFixed(1)),
    tiempoPorKm: `${minPorKm.toFixed(1)} min/km`,
    detalle: `${km} km en ${min} minutos = ${velocidad.toFixed(1)} km/h promedio (${minPorKm.toFixed(1)} min por km). ${comparacion}`,
  };
}
