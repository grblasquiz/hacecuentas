/** Calculadora Zona Habitable — d = √(L/L☉) × d☉ */
export interface Inputs { luminosidad: number; }
export interface Outputs { resultado: string; limiteInterno: number; limiteExterno: number; anchoZona: number; }

export function zonaHabitableEstrella(i: Inputs): Outputs {
  const L = Number(i.luminosidad);
  if (L <= 0) throw new Error('La luminosidad debe ser mayor a 0');

  // Kopparapu et al. (2013) conservative limits for Sun:
  // Inner edge (runaway greenhouse): ~0.95 AU for Sun
  // Outer edge (maximum greenhouse): ~1.37 AU for Sun
  // Scale with √L
  const sqrtL = Math.sqrt(L);
  const inner = 0.95 * sqrtL;
  const outer = 1.37 * sqrtL;
  const width = outer - inner;

  return {
    resultado: `Zona habitable: ${inner.toFixed(4)} — ${outer.toFixed(4)} UA`,
    limiteInterno: Number(inner.toFixed(6)),
    limiteExterno: Number(outer.toFixed(6)),
    anchoZona: Number(width.toFixed(6)),
  };
}
