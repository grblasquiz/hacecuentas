/** Mundial 2026 - Goles en prórroga */
export interface Inputs { minutosJugados: number; }
export interface Outputs { probGol: string; probPenales: string; contexto: string; }

export function mundial2026GolesProrroga(i: Inputs): Outputs {
  const m = Number(i.minutosJugados);
  if (isNaN(m) || m < 0 || m > 30) throw new Error('Minutos fuera de rango (0-30)');
  const base = 0.38;
  const restante = Math.max(0, (30 - m) / 30) * base;
  const penales = 1 - restante;
  return {
    probGol: `${(restante * 100).toFixed(1)}% de que caiga gol en los ${30 - m} minutos restantes`,
    probPenales: `${(penales * 100).toFixed(1)}% de probabilidad de ir a penales`,
    contexto: `Desde Francia 1998: 38% de las prórrogas en Mundiales tuvieron al menos un gol. 62% se definieron por penales. Los goles suelen caer entre los minutos 100-120.`,
  };
}
