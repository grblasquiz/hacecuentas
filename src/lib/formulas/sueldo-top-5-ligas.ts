/** Sueldo promedio Top-5 ligas europeas de fútbol (Premier, LaLiga, Bundesliga, Serie A, Ligue 1) */
export interface Inputs {
  liga: 'premier' | 'laliga' | 'bundesliga' | 'seriea' | 'ligue1';
  rol: 'estrella' | 'titular' | 'rotacion' | 'canterano';
  monedaSalida?: 'EUR' | 'USD' | 'GBP';
}
export interface Outputs {
  salarioAnualMin: number;
  salarioAnualMax: number;
  salarioAnualPromedio: number;
  salarioMensualPromedio: number;
  monedaBase: string;
  monedaSalida: string;
  ligaLabel: string;
  rolLabel: string;
  mensaje: string;
}

// Rango anual en moneda base de la liga (Premier en GBP, resto en EUR) — referencia 2025/26
const TABLA: Record<string, { moneda: 'EUR' | 'GBP'; label: string; estrella: [number, number]; titular: [number, number]; rotacion: [number, number]; canterano: [number, number] }> = {
  premier:    { moneda: 'GBP', label: 'Premier League',  estrella: [10_000_000, 25_000_000], titular: [3_000_000, 5_000_000], rotacion: [1_200_000, 2_500_000], canterano: [300_000, 800_000] },
  laliga:     { moneda: 'EUR', label: 'LaLiga',          estrella: [8_000_000, 20_000_000],  titular: [2_000_000, 4_000_000], rotacion: [900_000, 1_800_000],   canterano: [200_000, 600_000] },
  bundesliga: { moneda: 'EUR', label: 'Bundesliga',      estrella: [6_000_000, 15_000_000],  titular: [1_500_000, 3_000_000], rotacion: [700_000, 1_400_000],   canterano: [180_000, 500_000] },
  seriea:     { moneda: 'EUR', label: 'Serie A',         estrella: [6_500_000, 16_000_000],  titular: [1_800_000, 3_000_000], rotacion: [800_000, 1_500_000],   canterano: [180_000, 500_000] },
  ligue1:     { moneda: 'EUR', label: 'Ligue 1',         estrella: [5_000_000, 12_000_000],  titular: [1_200_000, 2_000_000], rotacion: [500_000, 1_000_000],   canterano: [150_000, 400_000] },
};

const ROL_LABEL: Record<string, string> = {
  estrella: 'Estrella / capitán',
  titular: 'Titular habitual',
  rotacion: 'Rotación',
  canterano: 'Canterano / fichaje juvenil',
};

// FX referenciales 2026
const FX: Record<string, Record<string, number>> = {
  EUR: { EUR: 1, USD: 1.08, GBP: 0.86 },
  GBP: { EUR: 1.16, USD: 1.26, GBP: 1 },
};

export function sueldoTop5Ligas(i: Inputs): Outputs {
  const liga = i.liga;
  const rol = i.rol;
  const salida = i.monedaSalida || 'EUR';
  const fila = TABLA[liga];
  if (!fila) throw new Error('Liga inválida. Usá premier, laliga, bundesliga, seriea o ligue1.');
  const rango = fila[rol];
  if (!rango) throw new Error('Rol inválido.');
  const [minBase, maxBase] = rango;
  const promBase = (minBase + maxBase) / 2;

  const factor = FX[fila.moneda]?.[salida] ?? 1;
  const min = minBase * factor;
  const max = maxBase * factor;
  const prom = promBase * factor;

  return {
    salarioAnualMin: Math.round(min),
    salarioAnualMax: Math.round(max),
    salarioAnualPromedio: Math.round(prom),
    salarioMensualPromedio: Math.round(prom / 12),
    monedaBase: fila.moneda,
    monedaSalida: salida,
    ligaLabel: fila.label,
    rolLabel: ROL_LABEL[rol],
    mensaje: `${fila.label} — ${ROL_LABEL[rol]}: ${Math.round(min).toLocaleString('es-AR')} a ${Math.round(max).toLocaleString('es-AR')} ${salida}/año.`,
  };
}
