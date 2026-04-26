/** Tiempo promedio Ironman 70.3/Full según edad y categoría AG */
export interface Inputs { distancia: 'half' | 'full'; edad: number; sexo: 'masculino' | 'femenino'; nivel: 'finisher' | 'mid-pack' | 'top-pack' | 'kona-qualifier'; }
export interface Outputs { tiempoEstimadoHoras: string; ritmoSwimMin100m: string; ritmoBikeKmh: number; ritmoRunMinKm: string; explicacion: string; }
export function triatlonIronmanTiempoMedioEdadCategoria(i: Inputs): Outputs {
  const edad = Number(i.edad);
  if (!edad || edad < 18 || edad > 80) throw new Error('Edad debe estar entre 18 y 80 años');
  // Tiempo base medio por nivel y distancia (horas)
  const base: Record<string, Record<string, number>> = {
    half: { finisher: 6.5, 'mid-pack': 5.5, 'top-pack': 4.7, 'kona-qualifier': 4.2 },
    full: { finisher: 13, 'mid-pack': 11.5, 'top-pack': 10, 'kona-qualifier': 9.2 },
  };
  let horas = base[i.distancia]?.[i.nivel] || 12;
  // Ajuste por sexo
  if (i.sexo === 'femenino') horas *= 1.10;
  // Ajuste por edad
  if (edad > 40) horas *= 1 + (edad - 40) * 0.005;
  if (edad < 30) horas *= 1 - (30 - edad) * 0.003;
  const totalSec = horas * 3600;
  // Distribución típica IM: 10% swim, 50% bike, 38% run, 2% T1+T2
  const swimSec = totalSec * 0.10;
  const bikeSec = totalSec * 0.50;
  const runSec = totalSec * 0.38;
  // Distancias
  const swimM = i.distancia === 'half' ? 1900 : 3800;
  const bikeKm = i.distancia === 'half' ? 90 : 180;
  const runKm = i.distancia === 'half' ? 21.1 : 42.2;
  const swimPace = (swimSec / (swimM / 100));
  const bikeKmh = bikeKm / (bikeSec / 3600);
  const runPace = (runSec / runKm);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
  const horasFmt = `${Math.floor(horas)}:${String(Math.round((horas % 1) * 60)).padStart(2, '0')}`;
  return {
    tiempoEstimadoHoras: horasFmt,
    ritmoSwimMin100m: fmt(swimPace),
    ritmoBikeKmh: Number(bikeKmh.toFixed(1)),
    ritmoRunMinKm: fmt(runPace),
    explicacion: `Ironman ${i.distancia === 'half' ? '70.3' : 'Full'} ${i.sexo} edad ${edad} nivel ${i.nivel}: tiempo estimado **${horasFmt} hs**. Ritmos: swim ${fmt(swimPace)}/100m, bike ${bikeKmh.toFixed(1)} km/h, run ${fmt(runPace)}/km.`,
  };
}
