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
  _insight?: any;
  _chart?: any;
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

  // Gauge sólo si hay W/kg real (potencia y peso ingresados); las zonas son las categorías FTP estándar (W/kg crece = mejor)
  const chart = wKg > 0 ? {
    type: 'scale' as const,
    marker: Number(wKg.toFixed(2)),
    markerLabel: 'Tu potencia: ' + wKg.toFixed(2) + ' W/kg',
    min: 0,
    unit: ' W/kg',
    segments: [
      { nombre: 'Recreativo', max: 2, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Aficionado', max: 3, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Entrenado', max: 4, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Cat. 2', max: 5, color: '#d9f99d', colorDark: '#4d7c0f' },
      { nombre: 'Élite', max: 6, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Pro', max: Math.max(7, Math.ceil(wKg) + 1), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de potencia en ciclismo (W/kg): tu valor ' + wKg.toFixed(2),
  } : undefined;

  const _insight = (wKg > 0)
    ? {
        title: 'Tu rendimiento sobre la bici',
        text: `Promediaste **${kmh.toFixed(1)} km/h** (${mm}:${String(ss).padStart(2, '0')} min/km) con **${wKg.toFixed(2)} W/kg**, lo que te ubica en nivel **${catFtp.replace(/\s*\([^)]*\)/, '')}**. El W/kg es el mejor predictor de rendimiento en subida.`,
        tone: (wKg >= 3 ? 'good' : 'neutral'),
        icon: '🚴',
      }
    : {
        title: 'Tu velocidad media',
        text: `Recorriste **${dist} km** en **${tiempo} min**, una media de **${kmh.toFixed(1)} km/h** (${mph.toFixed(1)} mph), o sea **${mm}:${String(ss).padStart(2, '0')} min/km**. Cargá tus watts y peso para ver tu nivel en W/kg.`,
        tone: 'neutral',
        icon: '🚴',
      };

  return {
    velocidadKmh: Number(kmh.toFixed(2)),
    velocidadMph: Number(mph.toFixed(2)),
    tiempoPorKm: `${mm}:${String(ss).padStart(2, '0')} min/km`,
    wattsPorKg: Number(wKg.toFixed(2)),
    categoriaFtp: catFtp,
    _insight,
    _chart: chart,
  };
}
