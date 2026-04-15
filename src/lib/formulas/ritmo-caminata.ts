/** Pasos por kilómetro y ritmo de caminata */
export interface Inputs { pasosTotales: number; tiempoMinutos: number; alturaPersona: number; }
export interface Outputs {
  distanciaKm: number;
  pasosporKm: number;
  velocidadKmh: number;
  caloriasEstimadas: number;
  detalle: string;
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

  return {
    distanciaKm: Number(distanciaKm.toFixed(2)),
    pasosporKm: pasosKm,
    velocidadKmh: Number(velocidad.toFixed(2)),
    caloriasEstimadas: Math.round(calorias),
    detalle: `${fmt.format(pasos)} pasos con zancada de ${fmt.format(zancada)} m (altura ${altura} cm) = ${fmt.format(distanciaKm)} km en ${fmt.format(min)} min → ${fmt.format(velocidad)} km/h, ~${pasosKm} pasos/km. Calorías estimadas: ~${Math.round(calorias)} kcal (ref 75 kg).`,
  };
}
