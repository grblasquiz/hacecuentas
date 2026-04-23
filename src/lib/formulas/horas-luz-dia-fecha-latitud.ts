/** Horas de luz según fecha del año y latitud
 *  daylight = 24/π × acos(−tan(φ)·tan(δ))
 *  δ (declinación solar) = 23.45° × sin(360°/365 × (N + 284))
 */
export interface Inputs {
  fecha: string; // YYYY-MM-DD
  latitud: number; // grados (positivo N, negativo S)
}
export interface Outputs {
  horasLuz: string;
  declinacionSolar: string;
  diaDelAnio: string;
  categoria: string;
  comentario: string;
}

function dayOfYear(fecha: string): number {
  const d = new Date(fecha + 'T12:00:00Z');
  if (isNaN(d.getTime())) throw new Error('Fecha inválida (usar YYYY-MM-DD)');
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 0));
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function horasLuzDiaFechaLatitud(i: Inputs): Outputs {
  const lat = Number(i.latitud);
  if (isNaN(lat) || lat < -90 || lat > 90) {
    throw new Error('Latitud debe estar entre -90 y 90 grados');
  }
  const N = dayOfYear(i.fecha);
  const rad = Math.PI / 180;

  // Declinación solar (Cooper, 1969)
  const delta = 23.45 * Math.sin(rad * (360 / 365) * (N + 284));

  const phi = lat * rad;
  const deltaRad = delta * rad;

  // Argumento del arco coseno
  const arg = -Math.tan(phi) * Math.tan(deltaRad);

  let horas: number;
  let comentario = '';
  if (arg <= -1) {
    horas = 24;
    comentario = 'Día polar: sol visible las 24 horas (latitud alta en verano local).';
  } else if (arg >= 1) {
    horas = 0;
    comentario = 'Noche polar: el sol no sale ese día (latitud alta en invierno local).';
  } else {
    horas = (24 / Math.PI) * Math.acos(arg);
    comentario = `Día normal con alternancia día/noche. En el ecuador (lat 0°) el valor queda cerca de 12 h todo el año.`;
  }

  let categoria = 'Normal';
  if (horas >= 23) categoria = 'Día polar (sol continuo)';
  else if (horas <= 1) categoria = 'Noche polar (sin sol)';
  else if (horas >= 15) categoria = 'Día largo (verano en esa latitud)';
  else if (horas <= 9) categoria = 'Día corto (invierno en esa latitud)';
  else categoria = 'Día moderado';

  const hh = Math.floor(horas);
  const mm = Math.round((horas - hh) * 60);

  return {
    horasLuz: `${horas.toFixed(2)} horas (${hh}h ${mm}min)`,
    declinacionSolar: `${delta.toFixed(2)}°`,
    diaDelAnio: `Día ${N} del año`,
    categoria,
    comentario,
  };
}
