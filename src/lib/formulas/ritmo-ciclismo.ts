/** Ritmo y potencia de ciclismo */
export interface Inputs {
  distanciaKm: number;
  tiempoMin: number;
  potenciaWatts?: number;
  pesoCiclistaBici?: number;
}
export interface Outputs {
  velocidadKmh: number;
  velocidadMph: number;
  tiempoPorKm: string;
  wattsPorKg: number;
  categoriaFtp: string;
}

export function ritmoCiclismo(i: Inputs): Outputs {
  const dist = Number(i.distanciaKm);
  const tiempo = Number(i.tiempoMin);
  const watts = Number(i.potenciaWatts) || 0;
  const peso = Number(i.pesoCiclistaBici) || 0;
  if (!dist || dist <= 0) throw new Error('Ingresá la distancia');
  if (!tiempo || tiempo <= 0) throw new Error('Ingresá el tiempo');

  const kmh = dist / (tiempo / 60);
  const mph = kmh * 0.621371;
  const minPorKm = tiempo / dist;
  const mm = Math.floor(minPorKm);
  const ss = Math.round((minPorKm - mm) * 60);

  let wKg = 0;
  let catFtp = '';
  if (watts > 0 && peso > 0) {
    wKg = watts / peso;
    if (wKg < 2) catFtp = 'Recreativo (< 2 W/kg)';
    else if (wKg < 3) catFtp = 'Aficionado activo (2-3 W/kg)';
    else if (wKg < 4) catFtp = 'Amateur entrenado (3-4 W/kg)';
    else if (wKg < 5) catFtp = 'Amateur Cat. 2 (4-5 W/kg)';
    else if (wKg < 5.5) catFtp = 'Amateur élite / Cat. 1 (5-5.5 W/kg)';
    else if (wKg < 6) catFtp = 'Pro continental';
    else catFtp = 'Pro World Tour (>6 W/kg)';
  }

  return {
    velocidadKmh: Number(kmh.toFixed(2)),
    velocidadMph: Number(mph.toFixed(2)),
    tiempoPorKm: `${mm}:${String(ss).padStart(2, '0')} min/km`,
    wattsPorKg: Number(wKg.toFixed(2)),
    categoriaFtp: catFtp,
  };
}
