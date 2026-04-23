/** Asistencias por 90 minutos (a/90) — métrica normalizada por minutaje */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function asistenciasPor90(i: Inputs): Outputs {
  const asistencias = Number(i.asistencias) || 0;
  const minutos = Number(i.minutos) || 0;
  const posicion = String(i.posicion || 'mediocampista');

  if (minutos <= 0) throw new Error('Ingresá minutos jugados');

  const a90 = (asistencias * 90) / minutos;

  const bench: Record<string, { elite: number; bueno: number; medio: number }> = {
    extremo: { elite: 0.5, bueno: 0.3, medio: 0.15 },
    mediocampista: { elite: 0.35, bueno: 0.2, medio: 0.1 },
    delantero: { elite: 0.3, bueno: 0.18, medio: 0.1 },
    defensor: { elite: 0.12, bueno: 0.06, medio: 0.03 },
  };
  const b = bench[posicion] ?? bench.mediocampista;

  const nivel = a90 >= b.elite ? 'Playmaker elite'
    : a90 >= b.bueno ? 'Buen generador'
    : a90 >= b.medio ? 'Nivel medio'
    : 'Debajo del promedio';

  return {
    a90: a90.toFixed(3),
    asistPor90: `${a90.toFixed(2)} asist/90 min`,
    partidosCompletos: `${(minutos / 90).toFixed(1)} partidos de 90'`,
    nivelComparativo: nivel,
    benchmarkPosicion: `Elite ${posicion}: ${b.elite} a/90 — Medio: ${b.medio} a/90`,
    interpretacion: `Con ${asistencias} asistencias en ${minutos} minutos, el jugador da ${a90.toFixed(2)} asistencias cada 90'. Proyectado a 38 jornadas completas: ${(a90 * 38).toFixed(0)} asistencias.`,
  };
}
