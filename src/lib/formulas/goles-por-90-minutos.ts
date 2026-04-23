/** Goles por 90 minutos (g/90) — métrica normalizada por minutaje */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function golesPor90Minutos(i: Inputs): Outputs {
  const goles = Number(i.goles) || 0;
  const minutos = Number(i.minutos) || 0;
  const posicion = String(i.posicion || 'delantero');

  if (minutos <= 0) throw new Error('Ingresá minutos jugados');

  const g90 = (goles * 90) / minutos;

  // Benchmarks por posicion (top 5 ligas europeas, temporada regular)
  const bench: Record<string, { elite: number; bueno: number; medio: number }> = {
    delantero: { elite: 0.8, bueno: 0.5, medio: 0.3 },
    mediocampista: { elite: 0.5, bueno: 0.3, medio: 0.15 },
    defensor: { elite: 0.15, bueno: 0.08, medio: 0.04 },
  };
  const b = bench[posicion] ?? bench.delantero;

  const nivel = g90 >= b.elite ? 'Elite mundial'
    : g90 >= b.bueno ? 'Buen nivel'
    : g90 >= b.medio ? 'Nivel medio'
    : 'Debajo del promedio';

  const partidos90 = (minutos / 90).toFixed(1);

  return {
    g90: g90.toFixed(3),
    golesPor90: `${g90.toFixed(2)} goles/90 min`,
    partidosCompletos: `${partidos90} partidos de 90'`,
    nivelComparativo: nivel,
    benchmarkPosicion: `Elite ${posicion}: ${b.elite} g/90 — Medio: ${b.medio} g/90`,
    interpretacion: `Con ${goles} goles en ${minutos} min, el jugador anota ${g90.toFixed(2)} goles cada 90'. Equivale a ${(g90 * 38).toFixed(0)} goles en una temporada completa de 38 jornadas.`,
  };
}
