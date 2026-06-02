/** Velocidad promedio de carrera — km/h y pace */
export interface Inputs { distanciaKm: number; tiempoMinutos: number; }
export interface Outputs {
  velocidadKmh: number;
  paceMinKm: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function velocidadCarrera(i: Inputs): Outputs {
  const dist = Number(i.distanciaKm);
  const min = Number(i.tiempoMinutos);
  if (!dist || dist <= 0) throw new Error('Ingresá la distancia en km');
  if (!min || min <= 0) throw new Error('Ingresá el tiempo en minutos');

  const horas = min / 60;
  const velocidad = dist / horas;
  const paceDecimal = min / dist;
  const paceMin = Math.floor(paceDecimal);
  const paceSeg = Math.round((paceDecimal - paceMin) * 60);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const paceStr = `${paceMin}:${paceSeg.toString().padStart(2, '0')}`;

  let zona: string; let tone: 'good' | 'warn' | 'neutral';
  if (velocidad < 8) { zona = 'trote suave'; tone = 'neutral'; }
  else if (velocidad < 11) { zona = 'ritmo recreativo'; tone = 'neutral'; }
  else if (velocidad < 14) { zona = 'corredor entrenado'; tone = 'good'; }
  else if (velocidad < 18) { zona = 'ritmo competitivo'; tone = 'good'; }
  else { zona = 'nivel elite'; tone = 'good'; }

  return {
    velocidadKmh: Number(velocidad.toFixed(2)),
    paceMinKm: `${paceStr} min/km`,
    detalle: `Recorriste ${fmt.format(dist)} km en ${fmt.format(min)} minutos → velocidad promedio de ${fmt.format(velocidad)} km/h con un pace de ${paceStr} min/km.`,
    _insight: {
      title: 'Tu ritmo de carrera',
      text: `Corriste a **${fmt.format(velocidad)} km/h** (pace **${paceStr} min/km**), un ${zona}. A este ritmo, un 10K te tomaría unos **${fmt.format(paceDecimal * 10)} minutos**.`,
      tone,
      icon: '🏃',
    },
    _chart: {
      type: 'scale',
      marker: Number(velocidad.toFixed(1)),
      markerLabel: `${fmt.format(velocidad)} km/h`,
      min: 0,
      segments: [
        { nombre: 'Trote suave', max: 8, color: '#93c5fd', colorDark: '#3b82f6' },
        { nombre: 'Recreativo', max: 11, color: '#86efac', colorDark: '#22c55e' },
        { nombre: 'Entrenado', max: 14, color: '#fde047', colorDark: '#eab308' },
        { nombre: 'Competitivo', max: 18, color: '#fdba74', colorDark: '#f97316' },
        { nombre: 'Elite', max: Math.max(24, Math.ceil(velocidad + 2)), color: '#f9a8d4', colorDark: '#ec4899' },
      ],
      ariaLabel: `Velocidad de ${fmt.format(velocidad)} km/h ubicada en la zona de ${zona}`,
    },
  };
}
