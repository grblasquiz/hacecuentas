/** Tiempo Método Feynman por tema */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  paso1Min: number;
  paso2Min: number;
  paso3Min: number;
  paso4Min: number;
  totalMin: number;
}

export function metodoFeynmanTiempo(i: Inputs): Outputs {
  const comp = String(i.complejidad || 'media');
  const fam = String(i.familiaridad || 'alguna');

  const BASE: Record<string, number[]> = {
    baja:  [10, 10, 10, 5],
    media: [20, 15, 15, 10],
    alta:  [30, 20, 25, 15],
  };
  const b = BASE[comp] || BASE.media;

  const factorFam: Record<string, number> = { nula: 1.3, alguna: 1, buena: 0.7 };
  const f = factorFam[fam] || 1;

  const p1 = Math.round(b[0] * f);
  const p2 = Math.round(b[1] * f);
  const p3 = Math.round(b[2] * f);
  const p4 = Math.round(b[3] * f);
  const total = p1 + p2 + p3 + p4;

  return {
    paso1Min: p1,
    paso2Min: p2,
    paso3Min: p3,
    paso4Min: p4,
    totalMin: total,
  };

}
