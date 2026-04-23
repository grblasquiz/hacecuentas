/** % pases completados con benchmarks por posicion (top 5 ligas europeas) */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function porcentajePasesCompletados(i: Inputs): Outputs {
  const completados = Number(i.pasesCompletados) || 0;
  const intentados = Number(i.pasesIntentados) || 0;
  const posicion = String(i.posicion || 'mediocampista');

  if (intentados <= 0) throw new Error('Ingresá pases intentados');
  if (completados > intentados) throw new Error('Los completados no pueden superar los intentados');

  const pct = (completados / intentados) * 100;

  // Benchmarks top 5 ligas (FBref, 2023-2025)
  const bench: Record<string, { elite: number; medio: number; bajo: number }> = {
    portero: { elite: 85, medio: 78, bajo: 70 },
    defensor: { elite: 92, medio: 86, bajo: 78 },
    'lateral': { elite: 88, medio: 82, bajo: 74 },
    mediocampista: { elite: 90, medio: 85, bajo: 78 },
    'mediapunta': { elite: 85, medio: 78, bajo: 70 },
    extremo: { elite: 82, medio: 75, bajo: 68 },
    delantero: { elite: 80, medio: 72, bajo: 65 },
  };
  const b = bench[posicion] ?? bench.mediocampista;

  const nivel = pct >= b.elite ? 'Elite top 5 ligas'
    : pct >= b.medio ? 'Sobre el promedio'
    : pct >= b.bajo ? 'Promedio / bajo'
    : 'Muy bajo para la posición';

  return {
    porcentajeCompletado: `${pct.toFixed(1)}%`,
    pasesCompletadosNum: `${completados} de ${intentados}`,
    nivelComparativo: nivel,
    benchmarkPosicion: `Elite ${posicion}: ${b.elite}% — Medio: ${b.medio}% — Bajo: ${b.bajo}%`,
    interpretacion: `${completados} completados sobre ${intentados} intentados = ${pct.toFixed(1)}%. Para ${posicion}, ${nivel.toLowerCase()}.`,
  };
}
