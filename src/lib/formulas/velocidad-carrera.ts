/** Velocidad promedio de carrera — km/h y pace */
export interface Inputs { distanciaKm: number; tiempoMinutos: number; }
export interface Outputs {
  velocidadKmh: number;
  paceMinKm: string;
  detalle: string;
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

  return {
    velocidadKmh: Number(velocidad.toFixed(2)),
    paceMinKm: `${paceMin}:${paceSeg.toString().padStart(2, '0')} min/km`,
    detalle: `Recorriste ${fmt.format(dist)} km en ${fmt.format(min)} minutos → velocidad promedio de ${fmt.format(velocidad)} km/h con un pace de ${paceMin}:${paceSeg.toString().padStart(2, '0')} min/km.`,
  };
}
