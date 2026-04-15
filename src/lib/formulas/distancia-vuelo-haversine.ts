/** Distancia entre 2 ciudades en km usando la fórmula de Haversine */
export interface Inputs {
  lat1: number;
  lng1: number;
  lat2: number;
  lng2: number;
}

export interface Outputs {
  distanciaKm: number;
  distanciaMi: number;
  distanciaNm: number;
  tiempoVueloEstimado: string;
  resumen: string;
}

export function distanciaVueloHaversine(i: Inputs): Outputs {
  const lat1 = Number(i.lat1);
  const lng1 = Number(i.lng1);
  const lat2 = Number(i.lat2);
  const lng2 = Number(i.lng2);

  if (isNaN(lat1) || isNaN(lng1)) throw new Error('Ingresá lat y lng de la ciudad 1');
  if (isNaN(lat2) || isNaN(lng2)) throw new Error('Ingresá lat y lng de la ciudad 2');
  if (Math.abs(lat1) > 90 || Math.abs(lat2) > 90) throw new Error('Las latitudes deben estar entre -90 y 90');
  if (Math.abs(lng1) > 180 || Math.abs(lng2) > 180) throw new Error('Las longitudes deben estar entre -180 y 180');

  const R = 6371; // radio terrestre km
  const toRad = (d: number) => (d * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  const mi = km * 0.621371;
  const nm = km * 0.539957;

  // Tiempo estimado con velocidad de crucero 850 km/h + 30 min de taxeo y maniobras
  const horasVuelo = km / 850 + 0.5;
  const h = Math.floor(horasVuelo);
  const m = Math.round((horasVuelo - h) * 60);
  const tiempo = `${h}h ${String(m).padStart(2, '0')}m`;

  return {
    distanciaKm: Number(km.toFixed(2)),
    distanciaMi: Number(mi.toFixed(2)),
    distanciaNm: Number(nm.toFixed(2)),
    tiempoVueloEstimado: tiempo,
    resumen: `La distancia ortodrómica (círculo máximo) entre los dos puntos es de **${km.toFixed(0)} km** (${mi.toFixed(0)} mi). Un vuelo comercial la recorre en aproximadamente ${tiempo}.`,
  };
}
