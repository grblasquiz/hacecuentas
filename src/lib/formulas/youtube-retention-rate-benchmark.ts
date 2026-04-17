/** Retention Rate YouTube */
export interface Inputs { duracionPromedio: number; duracionTotal: number; }
export interface Outputs { retentionRate: string; benchmark: string; calificacion: string; segundosAbandonoPromedio: string; }

export function youtubeRetentionRateBenchmark(i: Inputs): Outputs {
  const avd = Number(i.duracionPromedio);
  const total = Number(i.duracionTotal);
  if (avd <= 0 || total <= 0) throw new Error('Ingresá duraciones válidas');
  if (avd > total) throw new Error('La duración vista no puede superar la total');
  const rr = (avd / total) * 100;
  let bench = 40;
  if (total < 3) bench = 55;
  else if (total < 5) bench = 50;
  else if (total < 10) bench = 40;
  else if (total < 20) bench = 35;
  else if (total < 30) bench = 30;
  else bench = 25;
  let calif = '';
  if (rr < bench * 0.7) calif = 'Bajo — el algoritmo te está castigando';
  else if (rr < bench) calif = 'Aceptable — por debajo del benchmark';
  else if (rr < bench * 1.25) calif = 'Bueno — estás en el promedio alto';
  else calif = 'Excelente — el algoritmo te va a empujar';
  return {
    retentionRate: `${rr.toFixed(1)}%`,
    benchmark: `Benchmark para videos de ${total.toFixed(1)} min: ${bench}%`,
    calificacion: calif,
    segundosAbandonoPromedio: `El espectador promedio abandona al minuto ${avd.toFixed(1)}`,
  };
}
