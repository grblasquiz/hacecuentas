/** Calculadora de velocidad promedio en trayecto urbano */
export interface Inputs {
  distanciaKm: number;
  tiempoMinutos: number;
}
export interface Outputs {
  velocidadPromedio: number;
  tiempoPorKm: string;
  detalle: string;
  _chart?: any;
  _insight?: any;
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

  const velRound = Number(velocidad.toFixed(1));
  const chart = {
    type: 'scale' as const,
    marker: velRound,
    markerLabel: 'Tu promedio: ' + velRound + ' km/h',
    min: 0,
    unit: ' km/h',
    segments: [
      { nombre: 'Muy lento', max: 10, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Hora pico', max: 18, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Moderado', max: 30, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Fluido', max: 50, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Ruta', max: Math.max(80, Math.ceil(velRound) + 20), color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: 'Escala de velocidad promedio en ciudad en km/h: de muy lento a velocidad de ruta.',
  };

  const insight = {
    title: 'Tu velocidad promedio',
    text: `Recorriste **${km} km en ${min} minutos**: un promedio de **${velRound} km/h** (${minPorKm.toFixed(1)} min por km). ${comparacion}`,
    tone: velocidad < 10 ? 'warn' : (velocidad >= 30 ? 'good' : 'neutral'),
    icon: '🚗',
  };

  return {
    velocidadPromedio: velRound,
    tiempoPorKm: `${minPorKm.toFixed(1)} min/km`,
    detalle: `${km} km en ${min} minutos = ${velocidad.toFixed(1)} km/h promedio (${minPorKm.toFixed(1)} min por km). ${comparacion}`,
    _chart: chart,
    _insight: insight,
  };
}
