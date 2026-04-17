/** Rate freelance por pais/mercado */
export interface Inputs {
  rateBase: number;
  mercado: string;
}
export interface Outputs {
  rateSugerido: number;
  multiplicador: number;
  rangoMin: number;
  rangoMax: number;
}
export function horaFreelancePorPaisMercado(i: Inputs): Outputs {
  const base = Number(i.rateBase);
  const mkt = String(i.mercado || 'latam');
  if (!base || base <= 0) throw new Error('Ingresá el rate base');
  const mults: Record<string, number> = { usa: 1.5, uk: 1.4, europa: 1.3, australia: 1.35, latam: 0.7, asia: 0.6 };
  const mult = mults[mkt] || 1.0;
  const rate = base * mult;
  return {
    rateSugerido: Math.round(rate),
    multiplicador: Number(mult.toFixed(2)),
    rangoMin: Math.round(rate * 0.8),
    rangoMax: Math.round(rate * 1.2)
  };
}
