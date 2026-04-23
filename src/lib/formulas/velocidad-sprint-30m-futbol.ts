/** Velocidad promedio en sprint 30m para futbolistas por posición */
export interface Inputs {
  tiempo: number; // segundos
  posicion: string;
}

export interface Outputs {
  velocidadPromedioKmh: number;
  velocidadPromedioMs: number;
  categoria: string;
  benchmarkPosicion: string;
  diferenciaBenchmark: number;
  detalle: string;
}

// Tiempo 30m (s) de referencia elite masculino por posición
const BENCHMARKS: Record<string, { t: number; nombre: string }> = {
  'arquero':       { t: 4.50, nombre: 'Arquero' },
  'defensor':      { t: 4.00, nombre: 'Defensor' },
  'mediocampista': { t: 3.90, nombre: 'Mediocampista' },
  'delantero':     { t: 3.60, nombre: 'Delantero' },
};

function getCategoria(tiempo: number): string {
  if (tiempo <= 3.55) return 'Récord mundial (nivel Mbappé)';
  if (tiempo <= 3.75) return 'Élite profesional';
  if (tiempo <= 4.00) return 'Profesional promedio';
  if (tiempo <= 4.30) return 'Semiprofesional';
  if (tiempo <= 4.70) return 'Amateur avanzado';
  if (tiempo <= 5.20) return 'Amateur intermedio';
  return 'Amateur inicial';
}

export function velocidadSprint30mFutbol(i: Inputs): Outputs {
  const t = Number(i.tiempo);
  const pos = String(i.posicion || 'mediocampista');

  if (!t || t <= 0) throw new Error('Ingresá el tiempo en segundos');
  if (t > 15) throw new Error('Tiempo fuera de rango (máx 15s)');

  const ms = 30 / t;
  const kmh = ms * 3.6;

  const bench = BENCHMARKS[pos] || BENCHMARKS['mediocampista'];
  const dif = t - bench.t;
  const cat = getCategoria(t);

  return {
    velocidadPromedioKmh: Number(kmh.toFixed(2)),
    velocidadPromedioMs: Number(ms.toFixed(2)),
    categoria: cat,
    benchmarkPosicion: `${bench.nombre}: ${bench.t.toFixed(2)} s`,
    diferenciaBenchmark: Number(dif.toFixed(2)),
    detalle: `30 m en **${t.toFixed(2)} s** = ${kmh.toFixed(2)} km/h. Categoría: **${cat}**. Benchmark élite ${bench.nombre}: ${bench.t}s (diferencia: ${dif > 0 ? '+' : ''}${dif.toFixed(2)}s).`,
  };
}
