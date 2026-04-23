/** Mundial 2026 - Comparador de Selecciones */
export interface Inputs {
  seleccion1: string; ranking1: number; titulos1: number; golesProm1: number;
  seleccion2: string; ranking2: number; titulos2: number; golesProm2: number;
}
export interface Outputs { score1: string; score2: string; ganador: string; resumen: string; }

function scoreSeleccion(ranking: number, titulos: number, golesProm: number): number {
  // Ranking: puesto 1 = 100 pts, se degrada linealmente hasta puesto 100 = 0
  const rk = Math.max(0, 100 - (ranking - 1));
  // Títulos: 20 pts cada uno, máximo 5 = 100
  const tt = Math.min(100, titulos * 20);
  // Goles: 2.5 gol/partido = 100 pts
  const gg = Math.min(100, (golesProm / 2.5) * 100);
  return 0.4 * rk + 0.4 * tt + 0.2 * gg;
}

export function mundial2026ComparadorSelecciones(i: Inputs): Outputs {
  const s1 = String(i.seleccion1 || 'Selección 1');
  const s2 = String(i.seleccion2 || 'Selección 2');
  const r1 = Number(i.ranking1); const r2 = Number(i.ranking2);
  const t1 = Number(i.titulos1) || 0; const t2 = Number(i.titulos2) || 0;
  const g1 = Number(i.golesProm1) || 0; const g2 = Number(i.golesProm2) || 0;
  if (!r1 || !r2 || r1 < 1 || r2 < 1) throw new Error('Ranking FIFA inválido');
  const sc1 = scoreSeleccion(r1, t1, g1);
  const sc2 = scoreSeleccion(r2, t2, g2);
  const diff = Math.abs(sc1 - sc2);
  let ganador: string;
  if (diff < 3) ganador = `Paridad: ${s1} y ${s2} llegan parejas.`;
  else if (sc1 > sc2) ganador = `${s1} es favorita según los datos.`;
  else ganador = `${s2} es favorita según los datos.`;
  return {
    score1: `${s1}: ${sc1.toFixed(1)} / 100`,
    score2: `${s2}: ${sc2.toFixed(1)} / 100`,
    ganador,
    resumen: `Diferencia de score: ${diff.toFixed(1)} puntos. Ranking (40%) + Títulos (40%) + Goles (20%).`,
  };
}
