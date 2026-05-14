/** Mundial 2026: comparador de las 16 sedes oficiales (capacidad, altura, ciudad, clima, distancia). */
export interface Inputs {
  estadioA: string;
  estadioB: string;
}

export interface Outputs {
  estadioAInfo: string;
  estadioBInfo: string;
  distanciaKm: number;
  diferenciaAltura: number;
  recomendacion: string;
}

interface StadiumData {
  nombre: string;
  ciudad: string;
  pais: string;
  capacidad: number;
  altura: number; // metros sobre el nivel del mar
  climaJunJul: string;
  tempPromedio: number; // °C
  lat: number;
  lon: number;
}

const STADIUMS: Record<string, StadiumData> = {
  att: { nombre: "AT&T Stadium", ciudad: "Arlington, TX", pais: "USA", capacidad: 80000, altura: 180, climaJunJul: "33°C calor seco, techo retráctil", tempPromedio: 33, lat: 32.7473, lon: -97.0945 },
  mercedes: { nombre: "Mercedes-Benz Stadium", ciudad: "Atlanta, GA", pais: "USA", capacidad: 71000, altura: 320, climaJunJul: "30°C húmedo, techo retráctil", tempPromedio: 30, lat: 33.7553, lon: -84.4006 },
  gillette: { nombre: "Gillette Stadium", ciudad: "Foxborough, MA", pais: "USA", capacidad: 65878, altura: 80, climaJunJul: "25°C templado", tempPromedio: 25, lat: 42.0909, lon: -71.2643 },
  arrowhead: { nombre: "Arrowhead Stadium", ciudad: "Kansas City, MO", pais: "USA", capacidad: 76000, altura: 270, climaJunJul: "31°C templado-húmedo", tempPromedio: 31, lat: 39.0489, lon: -94.4839 },
  sofi: { nombre: "SoFi Stadium", ciudad: "Los Angeles, CA", pais: "USA", capacidad: 70240, altura: 30, climaJunJul: "23°C agradable, techo cubierto", tempPromedio: 23, lat: 33.9534, lon: -118.3387 },
  hardrock: { nombre: "Hard Rock Stadium", ciudad: "Miami Gardens, FL", pais: "USA", capacidad: 65000, altura: 3, climaJunJul: "32°C humedad 90%, abierto", tempPromedio: 32, lat: 25.9580, lon: -80.2389 },
  metlife: { nombre: "MetLife Stadium", ciudad: "East Rutherford, NJ", pais: "USA", capacidad: 82500, altura: 7, climaJunJul: "28°C húmedo (sede final)", tempPromedio: 28, lat: 40.8135, lon: -74.0745 },
  lincoln: { nombre: "Lincoln Financial Field", ciudad: "Philadelphia, PA", pais: "USA", capacidad: 69000, altura: 10, climaJunJul: "28°C húmedo", tempPromedio: 28, lat: 39.9008, lon: -75.1675 },
  lumen: { nombre: "Lumen Field", ciudad: "Seattle, WA", pais: "USA", capacidad: 68740, altura: 50, climaJunJul: "22°C templado seco", tempPromedio: 22, lat: 47.5952, lon: -122.3316 },
  nrg: { nombre: "NRG Stadium", ciudad: "Houston, TX", pais: "USA", capacidad: 72000, altura: 13, climaJunJul: "35°C extremo + humedad, techo retráctil", tempPromedio: 35, lat: 29.6847, lon: -95.4107 },
  levis: { nombre: "Levi's Stadium", ciudad: "Santa Clara, CA", pais: "USA", capacidad: 68500, altura: 5, climaJunJul: "21°C ideal", tempPromedio: 21, lat: 37.4030, lon: -121.9696 },
  azteca: { nombre: "Estadio Azteca", ciudad: "CDMX", pais: "México", capacidad: 83264, altura: 2240, climaJunJul: "22°C templado seco, ALTURA EXTREMA", tempPromedio: 22, lat: 19.3030, lon: -99.1503 },
  akron: { nombre: "Estadio Akron", ciudad: "Guadalajara", pais: "México", capacidad: 49850, altura: 1566, climaJunJul: "22°C con lluvias frecuentes", tempPromedio: 22, lat: 20.6819, lon: -103.4625 },
  bbva: { nombre: "Estadio BBVA", ciudad: "Monterrey", pais: "México", capacidad: 53500, altura: 540, climaJunJul: "33°C calor seco", tempPromedio: 33, lat: 25.6692, lon: -100.2444 },
  bmo: { nombre: "BMO Field", ciudad: "Toronto", pais: "Canadá", capacidad: 45000, altura: 76, climaJunJul: "24°C templado", tempPromedio: 24, lat: 43.6332, lon: -79.4185 },
  bcplace: { nombre: "BC Place", ciudad: "Vancouver", pais: "Canadá", capacidad: 54500, altura: 0, climaJunJul: "20°C fresco, techo retráctil", tempPromedio: 20, lat: 49.2767, lon: -123.1119 },
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // radio Tierra km
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatInfo(s: StadiumData): string {
  return `**${s.nombre}** (${s.ciudad}, ${s.pais}) — capacidad ~${s.capacidad.toLocaleString('es-AR')}, altura ${s.altura} m, clima ${s.climaJunJul}.`;
}

export function mundial2026EstadiosComparador(i: Inputs): Outputs {
  const keyA = String(i.estadioA || '').toLowerCase();
  const keyB = String(i.estadioB || '').toLowerCase();

  const a = STADIUMS[keyA];
  const b = STADIUMS[keyB];

  if (!a) throw new Error('Estadio A inválido.');
  if (!b) throw new Error('Estadio B inválido.');

  const distancia = haversineKm(a.lat, a.lon, b.lat, b.lon);
  const difAltura = Math.abs(a.altura - b.altura);

  // Determinar cuál es más exigente
  let exigente = '';
  const aScore = (a.altura >= 1500 ? 3 : a.altura >= 500 ? 1 : 0) + (a.tempPromedio >= 32 ? 2 : a.tempPromedio >= 28 ? 1 : 0);
  const bScore = (b.altura >= 1500 ? 3 : b.altura >= 500 ? 1 : 0) + (b.tempPromedio >= 32 ? 2 : b.tempPromedio >= 28 ? 1 : 0);

  if (keyA === keyB) {
    exigente = 'Elegiste el mismo estadio dos veces — sin diferencia que comparar.';
  } else if (aScore > bScore) {
    exigente = `**${a.nombre}** es más exigente físicamente (altura ${a.altura} m, ${a.tempPromedio}°C). Recomendación: aclimatarse al menos 4-7 días antes si tu equipo viene de jugar en ${b.nombre}.`;
  } else if (bScore > aScore) {
    exigente = `**${b.nombre}** es más exigente físicamente (altura ${b.altura} m, ${b.tempPromedio}°C). Recomendación: aclimatarse al menos 4-7 días antes si tu equipo viene de jugar en ${a.nombre}.`;
  } else {
    exigente = `Ambos estadios tienen un nivel similar de exigencia física. El cambio principal es el viaje de ${distancia} km y ${difAltura} m de diferencia de altura.`;
  }

  if (distancia > 3500) {
    exigente += ` Atención: la distancia entre sedes (${distancia} km) implica cruzar 3+ husos horarios — sumá ~1 día de adaptación por huso.`;
  }

  return {
    estadioAInfo: formatInfo(a),
    estadioBInfo: formatInfo(b),
    distanciaKm: distancia,
    diferenciaAltura: difAltura,
    recomendacion: exigente,
  };
}
