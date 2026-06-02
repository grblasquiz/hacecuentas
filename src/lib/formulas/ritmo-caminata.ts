/** Pasos por kilómetro y ritmo de caminata */
export interface Inputs { pasosTotales: number; tiempoMinutos: number; alturaPersona: number; }
export interface Outputs {
  distanciaKm: number;
  pasosporKm: number;
  velocidadKmh: number;
  caloriasEstimadas: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function ritmoCaminata(i: Inputs): Outputs {
  const pasos = Number(i.pasosTotales);
  const min = Number(i.tiempoMinutos);
  const altura = Number(i.alturaPersona);
  if (!pasos || pasos <= 0) throw new Error('Ingresá los pasos totales');
  if (!min || min <= 0) throw new Error('Ingresá el tiempo en minutos');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura en cm');

  // Longitud de zancada en metros
  const zancada = (altura * 0.415) / 100;
  const distanciaM = pasos * zancada;
  const distanciaKm = distanciaM / 1000;

  const pasosKm = Math.round(1000 / zancada);
  const horas = min / 60;
  const velocidad = distanciaKm / horas;

  // Calorías estimadas (peso ref 75 kg)
  let met = 3.5;
  if (velocidad < 4) met = 2.8;
  else if (velocidad < 5) met = 3.5;
  else if (velocidad < 6) met = 4.3;
  else met = 5.0;

  const pesoRef = 75;
  const kcalMin = (met * 3.5 * pesoRef) / 200;
  const calorias = kcalMin * min;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  // Categoría de ritmo según velocidad (km/h)
  let ritmoTxt: string; let tone: string;
  if (velocidad < 4) { ritmoTxt = 'un paseo tranquilo'; tone = 'neutral'; }
  else if (velocidad < 5) { ritmoTxt = 'un ritmo moderado'; tone = 'neutral'; }
  else if (velocidad < 6) { ritmoTxt = 'una caminata enérgica (saludable)'; tone = 'good'; }
  else { ritmoTxt = 'una marcha rápida (casi trote)'; tone = 'good'; }

  const _insight = {
    title: 'Tu ritmo de caminata',
    text: `Caminaste **${fmt.format(distanciaKm)} km** a **${fmt.format(velocidad)} km/h**, lo que es ${ritmoTxt}. Quemaste unas **${Math.round(calorias)} kcal** y diste cerca de **${pasosKm} pasos por kilómetro**.`,
    tone,
    icon: '🚶',
  };

  const _chart = {
    type: 'scale' as const,
    marker: Number(velocidad.toFixed(2)),
    markerLabel: fmt.format(velocidad) + ' km/h',
    min: 0,
    unit: ' km/h',
    segments: [
      { nombre: 'Tranquilo', max: 4, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Moderado', max: 5, color: '#d9f99d', colorDark: '#4d7c0f' },
      { nombre: 'Enérgico', max: 6, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Rápido', max: Math.max(8, Math.ceil(velocidad) + 1), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: `Escala de ritmo de caminata: tu velocidad es ${fmt.format(velocidad)} km/h`,
  };

  return {
    distanciaKm: Number(distanciaKm.toFixed(2)),
    pasosporKm: pasosKm,
    velocidadKmh: Number(velocidad.toFixed(2)),
    caloriasEstimadas: Math.round(calorias),
    detalle: `${fmt.format(pasos)} pasos con zancada de ${fmt.format(zancada)} m (altura ${altura} cm) = ${fmt.format(distanciaKm)} km en ${fmt.format(min)} min → ${fmt.format(velocidad)} km/h, ~${pasosKm} pasos/km. Calorías estimadas: ~${Math.round(calorias)} kcal (ref 75 kg).`,
    _insight,
    _chart,
  };
}
