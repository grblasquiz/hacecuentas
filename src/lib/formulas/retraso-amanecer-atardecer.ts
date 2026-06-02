/** Retraso (o adelanto) diario de amanecer/atardecer en minutos.
 *  Δdaylight(día) = daylight(N+1) − daylight(N)
 *  El amanecer se corre aprox. −Δ/2 minutos/día y el atardecer +Δ/2 minutos/día
 *  (signo varía según hemisferio/época).
 */
export interface Inputs {
  fecha: string;
  latitud: number;
}
export interface Outputs {
  cambioDuracionDia: string;
  cambioAmanecer: string;
  cambioAtardecer: string;
  categoria: string;
  comentario: string;
  _insight?: any;
  _chart?: any;
}

function dayOfYear(fecha: string): number {
  const d = new Date(fecha + 'T12:00:00Z');
  if (isNaN(d.getTime())) throw new Error('Fecha inválida (usar YYYY-MM-DD)');
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 0));
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

function daylightHours(N: number, latDeg: number): number {
  const rad = Math.PI / 180;
  const delta = 23.45 * Math.sin(rad * (360 / 365) * (N + 284));
  const arg = -Math.tan(latDeg * rad) * Math.tan(delta * rad);
  if (arg <= -1) return 24;
  if (arg >= 1) return 0;
  return (24 / Math.PI) * Math.acos(arg);
}

export function retrasoAmanecerAtardecer(i: Inputs): Outputs {
  const lat = Number(i.latitud);
  if (isNaN(lat) || lat < -90 || lat > 90) throw new Error('Latitud entre -90 y 90');
  const N = dayOfYear(i.fecha);

  const hoy = daylightHours(N, lat);
  const manana = daylightHours(N + 1, lat);
  const deltaHoras = manana - hoy; // puede ser negativo
  const deltaMin = deltaHoras * 60;
  const mitadMin = deltaMin / 2;

  // Signo amanecer: cuando el día crece, el amanecer se adelanta (sale más temprano) → negativo.
  // Cuando el día achica, el amanecer se retrasa (sale más tarde) → positivo.
  const amanecerMin = -mitadMin;
  const atardecerMin = mitadMin;

  const abs = Math.abs(deltaMin);
  let categoria = '';
  if (abs < 0.3) categoria = 'Cerca de solsticio (cambio mínimo)';
  else if (abs < 1.2) categoria = 'Transición (cambio moderado)';
  else categoria = 'Cerca de equinoccio (cambio máximo)';

  const signoDia = deltaMin >= 0 ? 'alargando' : 'acortando';
  const comentario =
    `El día se está ${signoDia} ${Math.abs(deltaMin).toFixed(2)} min/día. ` +
    `En el ecuador el valor es ~0 todo el año. En latitudes altas el cambio cerca del equinoccio ` +
    `puede superar 4 min/día.`;

  const fmt = (m: number) => (m >= 0 ? '+' : '') + m.toFixed(2) + ' min';

  const insightTone = abs < 0.3 ? 'neutral' : 'good';
  const insightText =
    `Hoy el día se está **${signoDia} ${abs.toFixed(2)} min**: el sol sale ${amanecerMin >= 0 ? 'más tarde' : 'más temprano'} (${fmt(amanecerMin)}) y anochece ${atardecerMin >= 0 ? 'más tarde' : 'más temprano'} (${fmt(atardecerMin)}). ` +
    (abs < 0.3
      ? `Estás cerca de un solsticio: la duración del día casi no se mueve.`
      : abs < 1.2
        ? `Ritmo intermedio entre solsticio y equinoccio.`
        : `Estás cerca de un equinoccio: es cuando el día cambia más rápido en el año.`);

  // Gauge sobre la MAGNITUD del cambio (independiente del signo): cerca de solsticio → equinoccio
  const mag = Math.round(abs * 100) / 100;
  const segMax = Math.max(2.5, Math.ceil(mag * 10) / 10 + 0.2);
  return {
    cambioDuracionDia: `${fmt(deltaMin)} (el día se está ${signoDia})`,
    cambioAmanecer: `${fmt(amanecerMin)} (${amanecerMin >= 0 ? 'sale más tarde' : 'sale más temprano'})`,
    cambioAtardecer: `${fmt(atardecerMin)} (${atardecerMin >= 0 ? 'anochece más tarde' : 'anochece más temprano'})`,
    categoria,
    comentario,
    _insight: {
      title: signoDia === 'alargando' ? 'El día se alarga' : 'El día se acorta',
      text: insightText,
      tone: insightTone,
      icon: signoDia === 'alargando' ? '🌅' : '🌇'
    },
    _chart: {
      type: 'scale',
      marker: mag,
      markerLabel: `${mag.toFixed(2)} min/día`,
      min: 0,
      segments: [
        { nombre: 'Cerca de solsticio', max: 0.3, color: '#6366f1', colorDark: '#4f46e5' },
        { nombre: 'Transición', max: 1.2, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Cerca de equinoccio', max: segMax, color: '#f97316', colorDark: '#ea580c' }
      ],
      ariaLabel: `El día cambia ${mag.toFixed(2)} minutos por día, sobre una escala que va de mínimo (solsticio) a máximo (equinoccio).`
    }
  };
}
