/** Premios FIFA Club World Cup 2025 (pool US$ 1B, 32 equipos) */
export interface Inputs {
  confederacion: string; // 'uefa' | 'conmebol' | 'concacaf' | 'afc' | 'caf' | 'ofc'
  fasefinal: string; // 'fase-grupos' | 'octavos' | 'cuartos' | 'semifinal' | 'final' | 'campeon'
  victoriasFase: number; // 0-3 victorias fase grupos
  empatesFase: number;
}

export interface Outputs {
  participacionBase: number;
  premioPorRendimiento: number;
  premioProgresion: number;
  premioTotal: number;
  moneda: string;
  resumen: string;
}

// Distribución oficial FIFA CWC 2025 (pool US$ 1.000 M)
// 525M participación + 475M performance
const BASE_CONFED: Record<string, number> = {
  uefa: 38_190_000, // clubes UEFA reciben más por el ranking
  conmebol: 16_900_000,
  concacaf: 9_550_000,
  afc: 9_550_000,
  caf: 9_550_000,
  ofc: 3_580_000,
};

const BONUS_FASE: Record<string, number> = {
  'fase-grupos': 0,
  octavos: 7_500_000,
  cuartos: 13_100_000,
  semifinal: 21_000_000,
  final: 30_000_000,
  campeon: 40_000_000,
};

const PREMIO_VICTORIA = 2_000_000;
const PREMIO_EMPATE = 1_000_000;

export function premiosMundialClubes2025(i: Inputs): Outputs {
  const conf = String(i.confederacion || 'conmebol');
  const fase = String(i.fasefinal || 'fase-grupos');
  const v = Math.max(0, Math.min(3, Number(i.victoriasFase) || 0));
  const e = Math.max(0, Math.min(3, Number(i.empatesFase) || 0));

  const base = BASE_CONFED[conf] ?? BASE_CONFED.conmebol;
  const rendim = v * PREMIO_VICTORIA + e * PREMIO_EMPATE;
  const progres = BONUS_FASE[fase] ?? 0;
  const total = base + rendim + progres;

  return {
    participacionBase: base,
    premioPorRendimiento: rendim,
    premioProgresion: progres,
    premioTotal: total,
    moneda: 'USD',
    resumen: `Club ${conf.toUpperCase()} en ${fase}: participación US$ ${(base / 1e6).toFixed(2)} M + rendimiento US$ ${(rendim / 1e6).toFixed(2)} M + progresión US$ ${(progres / 1e6).toFixed(2)} M = **US$ ${(total / 1e6).toFixed(2)} M**.`,
  };
}
