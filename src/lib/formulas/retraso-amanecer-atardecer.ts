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

  return {
    cambioDuracionDia: `${fmt(deltaMin)} (el día se está ${signoDia})`,
    cambioAmanecer: `${fmt(amanecerMin)} (${amanecerMin >= 0 ? 'sale más tarde' : 'sale más temprano'})`,
    cambioAtardecer: `${fmt(atardecerMin)} (${atardecerMin >= 0 ? 'anochece más tarde' : 'anochece más temprano'})`,
    categoria,
    comentario,
  };
}
